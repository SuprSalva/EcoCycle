import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SesionReciclajeService, SesionReciclaje } from '../../core/services/sesion-reciclaje.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/services/notification.service';
import { RecompensaService, Recompensa } from '../../core/services/recompensa.service';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MetricasIoT {
  maquinaId: string;
  totalSesiones: number;
  totalBotellas: number;
  promedioBotellas: number;
}

export interface MetricasUsuario {
  usuarioId: string;
  totalSesiones: number;
  totalBotellas: number;
  totalPuntos: number;
}

export interface MetricasFinanzas {
  totalPuntosEmitidos: number;
  totalPuntosCanjeados: number;
  valorInventarioActual: number;
  recompensaMasPopular: { nombre: string, cantidad: number } | null;
  alertasStock: Recompensa[];
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
  sesiones: SesionReciclaje[] = [];
  cargando: boolean = true;
  tabActiva: 'sesiones' | 'impacto' | 'iot' | 'usuarios' | 'finanzas' = 'impacto'; // Empezamos en impacto por defecto para que se vea

  // Métricas IoT
  metricasIoT: MetricasIoT[] = [];
  maquinaEstrella: MetricasIoT | null = null;

  // Métricas de Usuarios
  metricasUsuarios: MetricasUsuario[] = [];
  ecoHeroe: MetricasUsuario | null = null;

  // Métricas Financieras
  metricasFinanzas: MetricasFinanzas = {
    totalPuntosEmitidos: 0,
    totalPuntosCanjeados: 0,
    valorInventarioActual: 0,
    recompensaMasPopular: null,
    alertasStock: []
  };

  // Métricas de Impacto Ambiental
  totalBotellas: number = 0;
  
  get kgRecuperados(): number {
    return this.totalBotellas * 0.02; // Asumiendo 20 gramos por botella
  }

  get co2Evitado(): number {
    return this.totalBotellas * 0.06; // 0.06 kg de CO2 por botella
  }

  get aguaAhorrada(): number {
    return this.totalBotellas * 3; // 3 Litros de agua por botella
  }

  constructor(
    private sesionService: SesionReciclajeService,
    private recompensaService: RecompensaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSesiones();
  }

  cargarSesiones(): void {
    this.cargando = true;
    this.notificationService.showLoading('Cargando reportes...', 'Obteniendo inteligencia de negocio completa');
    
    // Ejecutar ambas llamadas en paralelo para alimentar todos los reportes
    forkJoin({
      sesionesRes: this.sesionService.obtenerTodasLasSesiones(),
      catalogoRes: this.recompensaService.obtenerTodasAdmin(),
      canjesRes: this.recompensaService.obtenerHistorialCanjesAdmin()
    }).subscribe({
      next: (resultados) => {
        // --- 1. PROCESAR SESIONES ---
        if (resultados.sesionesRes && resultados.sesionesRes.succeeded) {
          this.sesiones = resultados.sesionesRes.data.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          this.totalBotellas = this.sesiones.reduce((acc, curr) => acc + curr.botellas, 0);
          this.calcularMetricasIoT();
          this.calcularMetricasUsuarios();
          // Calcular puntos emitidos
          this.metricasFinanzas.totalPuntosEmitidos = this.sesiones.reduce((acc, curr) => acc + curr.puntos, 0);
        }

        // --- 2. PROCESAR FINANZAS E INVENTARIO ---
        let recompensas: Recompensa[] = [];
        let canjes: any[] = [];

        if (resultados.catalogoRes && resultados.catalogoRes.succeeded) {
          recompensas = resultados.catalogoRes.data;
        } else if (resultados.catalogoRes?.data) {
          recompensas = resultados.catalogoRes.data;
        }

        if (resultados.canjesRes && resultados.canjesRes.succeeded) {
          canjes = resultados.canjesRes.data;
        } else if (resultados.canjesRes?.data) {
          canjes = resultados.canjesRes.data;
        }

        this.calcularMetricasFinancieras(recompensas, canjes);

        this.cargando = false;
        this.notificationService.hideLoading();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Error', 'No se pudieron cargar todos los reportes.');
        this.cargando = false;
        this.notificationService.hideLoading();
      }
    });
  }

  calcularMetricasIoT(): void {
    const mapaMaquinas = new Map<string, MetricasIoT>();

    this.sesiones.forEach(sesion => {
      const mId = sesion.maquinaId || 'MQ-ECO-01'; // Fallback por si acaso
      if (!mapaMaquinas.has(mId)) {
        mapaMaquinas.set(mId, {
          maquinaId: mId,
          totalSesiones: 0,
          totalBotellas: 0,
          promedioBotellas: 0
        });
      }

      const stats = mapaMaquinas.get(mId)!;
      stats.totalSesiones += 1;
      stats.totalBotellas += sesion.botellas;
    });

    // Calcular promedios y encontrar la estrella
    let maxBotellas = -1;
    let estrella: MetricasIoT | null = null;

    this.metricasIoT = Array.from(mapaMaquinas.values()).map(stats => {
      stats.promedioBotellas = Number((stats.totalBotellas / stats.totalSesiones).toFixed(1));
      
      if (stats.totalBotellas > maxBotellas) {
        maxBotellas = stats.totalBotellas;
        estrella = stats;
      }
      
      return stats;
    });

    // Ordenar de mayor a menor botellas
    this.metricasIoT.sort((a, b) => b.totalBotellas - a.totalBotellas);
    this.maquinaEstrella = estrella;
  }

  calcularMetricasUsuarios(): void {
    const mapaUsuarios = new Map<string, MetricasUsuario>();

    this.sesiones.forEach(sesion => {
      const uId = sesion.usuarioId;
      if (!mapaUsuarios.has(uId)) {
        mapaUsuarios.set(uId, {
          usuarioId: uId,
          totalSesiones: 0,
          totalBotellas: 0,
          totalPuntos: 0
        });
      }

      const stats = mapaUsuarios.get(uId)!;
      stats.totalSesiones += 1;
      stats.totalBotellas += sesion.botellas;
      stats.totalPuntos += sesion.puntos;
    });

    let maxBotellas = -1;
    let heroe: MetricasUsuario | null = null;

    this.metricasUsuarios = Array.from(mapaUsuarios.values()).map(stats => {
      if (stats.totalBotellas > maxBotellas) {
        maxBotellas = stats.totalBotellas;
        heroe = stats;
      }
      return stats;
    });

    // Ordenar para el Leaderboard (top recicladores primero)
    this.metricasUsuarios.sort((a, b) => b.totalBotellas - a.totalBotellas);
    this.ecoHeroe = heroe;
  }

  calcularMetricasFinancieras(recompensas: Recompensa[], canjes: any[]): void {
    // 1. Calcular Pasivo Redimido (Puntos gastados en la historia)
    this.metricasFinanzas.totalPuntosCanjeados = canjes.reduce((acc, curr) => acc + curr.puntosUsados, 0);

    // 2. Calcular Valor de Inventario Actual
    this.metricasFinanzas.valorInventarioActual = recompensas.reduce((acc, r) => acc + (r.costoPuntos * r.stock), 0);

    // 3. Alertas de Stock (Stock < 5 y activa)
    this.metricasFinanzas.alertasStock = recompensas.filter(r => r.stock < 5 && r.activa);

    // 4. Recompensa Más Popular
    const conteoCanjes = new Map<string, number>();
    canjes.forEach(c => {
      const nombre = c.recompensaNombre || 'Desconocida';
      conteoCanjes.set(nombre, (conteoCanjes.get(nombre) || 0) + 1);
    });

    let maxVentas = 0;
    let popular = '';
    conteoCanjes.forEach((cantidad, nombre) => {
      if (cantidad > maxVentas) {
        maxVentas = cantidad;
        popular = nombre;
      }
    });

    if (popular) {
      this.metricasFinanzas.recompensaMasPopular = { nombre: popular, cantidad: maxVentas };
    }
  }

  exportarExcel(): void {
    if (this.sesiones.length === 0) {
      this.notificationService.warning('Atención', 'No hay datos para exportar.');
      return;
    }

    const data = this.sesiones.map(s => ({
      'ID Sesión': s.id,
      'Usuario (ID)': s.usuarioId,
      'Máquina IoT': s.maquinaId || 'MÁQUINA-01',
      'Botellas Recicladas': s.botellas,
      'EcoPuntos Generados': s.puntos,
      'Fecha y Hora': s.fecha ? new Date(s.fecha).toLocaleString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const wscols = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 25 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesiones Reciclaje');

    XLSX.writeFile(workbook, 'reporte_reciclaje_ecocycle.xlsx');
  }

  // --- EXPORTACIONES FINANCIERAS ---
  exportarFinanzasPDF(): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(17, 28, 67); 
    doc.text('Reporte Financiero y de Inventario', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Generado el: ' + new Date().toLocaleString(), 14, 30);

    // Resumen Ejecutivo
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resumen Ejecutivo:', 14, 45);
    doc.setFontSize(10);
    doc.text(`- Puntos Emitidos (Circulando): ${this.metricasFinanzas.totalPuntosEmitidos}`, 14, 52);
    doc.text(`- Pasivo Redimido (Gastados): ${this.metricasFinanzas.totalPuntosCanjeados}`, 14, 58);
    doc.text(`- Valor de Inventario Actual: ${this.metricasFinanzas.valorInventarioActual} Puntos`, 14, 64);
    
    if (this.metricasFinanzas.recompensaMasPopular) {
      doc.text(`- Producto Estrella: ${this.metricasFinanzas.recompensaMasPopular.nombre} (${this.metricasFinanzas.recompensaMasPopular.cantidad} canjes)`, 14, 70);
    }

    // Alertas de Stock
    doc.setFontSize(12);
    doc.text('Alertas de Stock Crítico (< 5 unidades):', 14, 85);
    
    if (this.metricasFinanzas.alertasStock.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(0, 150, 0);
      doc.text('Inventario saludable. No hay productos críticos.', 14, 92);
    } else {
      const headers = [['Producto', 'Costo (Puntos)', 'Stock Actual']];
      const data = this.metricasFinanzas.alertasStock.map(p => [
        p.nombre,
        p.costoPuntos.toString(),
        p.stock.toString()
      ]);

      autoTable(doc, {
        startY: 90,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69] }, // Rojo peligro
        styles: { fontSize: 10, cellPadding: 3 }
      });
    }

    doc.save('reporte_financiero_ecocycle.pdf');
  }

  exportarFinanzasExcel(): void {
    // Hoja 1: Resumen
    const resumenData = [
      { Métrica: 'Puntos Emitidos (Circulando)', Valor: this.metricasFinanzas.totalPuntosEmitidos },
      { Métrica: 'Pasivo Redimido (Gastados)', Valor: this.metricasFinanzas.totalPuntosCanjeados },
      { Métrica: 'Valor de Inventario Actual', Valor: this.metricasFinanzas.valorInventarioActual },
      { Métrica: 'Producto Estrella', Valor: this.metricasFinanzas.recompensaMasPopular ? this.metricasFinanzas.recompensaMasPopular.nombre : 'N/A' }
    ];
    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 35 }, { wch: 20 }];

    // Hoja 2: Alertas de Stock
    const alertasData = this.metricasFinanzas.alertasStock.map(p => ({
      'Producto': p.nombre,
      'Costo (Puntos)': p.costoPuntos,
      'Stock Actual': p.stock
    }));
    const wsAlertas = XLSX.utils.json_to_sheet(alertasData.length > 0 ? alertasData : [{ Mensaje: 'Inventario Saludable' }]);
    wsAlertas['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }];

    // Crear libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen Financiero');
    XLSX.utils.book_append_sheet(workbook, wsAlertas, 'Alertas Stock');

    XLSX.writeFile(workbook, 'reporte_financiero_ecocycle.xlsx');
  }
}
