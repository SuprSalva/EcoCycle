import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensaService } from '../../core/services/recompensa.service';
import { NotificationService } from '../../core/services/notification.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-historial-recompensas',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './historial-recompensas.component.html',
  styleUrls: ['./historial-recompensas.component.scss']
})
export class HistorialRecompensasComponent implements OnInit {
  listaCanjesOriginal: any[] = [];
  listaCanjesFiltrada: any[] = [];
  cargando: boolean = true;

  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  constructor(
    private recompensaService: RecompensaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.notificationService.showLoading('Cargando historial...', 'Obteniendo registros del servidor');
    
    // Si la fechaFin existe, añadirle la hora 23:59:59 para incluir todo ese día
    let finIso = '';
    if (this.fechaFin) {
      const finDate = new Date(this.fechaFin);
      finDate.setHours(23, 59, 59, 999);
      finIso = finDate.toISOString();
    }
    
    let inicioIso = '';
    if (this.fechaInicio) {
      inicioIso = new Date(this.fechaInicio).toISOString();
    }

    this.recompensaService.obtenerHistorialCanjesAdmin(inicioIso, finIso).subscribe({
      next: (response: any) => {
        this.notificationService.hideLoading();
        if (response && response.succeeded) {
          this.listaCanjesOriginal = response.data;
        } else {
          this.listaCanjesOriginal = response?.data || [];
        }
        this.aplicarFiltrosYOrden();
        this.cargando = false;
      },
      error: (err: any) => {
        this.notificationService.hideLoading();
        this.cargando = false;
        console.error('Error al cargar historial:', err);
        this.notificationService.error('Error', 'No se pudo cargar el historial de recompensas.');
        this.listaCanjesOriginal = [];
        this.aplicarFiltrosYOrden();
      }
    });
  }

  filtrarPorFechas(): void {
    if (this.fechaInicio && this.fechaFin && new Date(this.fechaInicio) > new Date(this.fechaFin)) {
      this.notificationService.warning('Fechas inválidas', 'La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarHistorial();
  }

  aplicarFiltrosYOrden(): void {
    let filtrados = [...this.listaCanjesOriginal];
    this.listaCanjesFiltrada = filtrados;
    this.totalPaginas = Math.ceil(this.listaCanjesFiltrada.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas;
    }
  }

  cambiarItemsPorPagina(event: any): void {
    this.itemsPorPagina = parseInt(event.target.value, 10);
    this.paginaActual = 1;
    this.aplicarFiltrosYOrden();
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get paginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaCanjesFiltrada.slice(inicio, fin);
  }

  get resumenPaginacion(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.listaCanjesFiltrada.length);
    const total = this.listaCanjesFiltrada.length;
    return total === 0 ? '0 resultados' : `${inicio} - ${fin} de ${total}`;
  }

  // --- EXPORTACIONES ---
  exportarPDF(): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(17, 28, 67); 
    doc.text('Historial Global de Recompensas Canjeadas', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text('Reporte generado el: ' + new Date().toLocaleDateString(), 14, 30);
    
    let subtextoFiltro = 'Mostrando todos los registros.';
    if (this.fechaInicio && this.fechaFin) {
      subtextoFiltro = `Rango: ${this.fechaInicio} a ${this.fechaFin}`;
    } else if (this.fechaInicio) {
      subtextoFiltro = `Desde: ${this.fechaInicio}`;
    } else if (this.fechaFin) {
      subtextoFiltro = `Hasta: ${this.fechaFin}`;
    }
    doc.text(subtextoFiltro, 14, 36);

    const headers = [['Usuario', 'Correo', 'Recompensa', 'Pts Usados', 'Fecha']];
    const data = this.listaCanjesFiltrada.map(c => [
      c.usuarioNombre,
      c.usuarioEmail,
      c.recompensaNombre,
      c.puntosUsados.toString(),
      new Date(c.fecha).toLocaleString()
    ]);

    autoTable(doc, {
      startY: 42,
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [13, 99, 27] },
      alternateRowStyles: { fillColor: [244, 247, 254] },
      styles: { fontSize: 10, cellPadding: 4 }
    });

    doc.save('historial_recompensas.pdf');
  }

  exportarExcel(): void {
    const data = this.listaCanjesFiltrada.map(c => ({
      'ID Canje': c.id,
      'Usuario': c.usuarioNombre,
      'Correo': c.usuarioEmail,
      'Recompensa': c.recompensaNombre,
      'Puntos Usados': c.puntosUsados,
      'Fecha y Hora': new Date(c.fecha).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const wscols = [
      { wch: 25 }, 
      { wch: 30 }, 
      { wch: 30 }, 
      { wch: 35 }, 
      { wch: 15 }, 
      { wch: 22 }  
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Canjes');

    XLSX.writeFile(workbook, 'historial_recompensas.xlsx');
  }
}
