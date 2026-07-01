import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensaService } from '../../core/services/recompensa.service';
import { NotificationService } from '../../core/services/notification.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';
import { ExportService } from '../../core/services/export.service';

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
    private notificationService: NotificationService,
    private exportService: ExportService
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

  marcarComoReclamado(id: string): void {
    if (confirm('¿Estás seguro de marcar esta recompensa como entregada/reclamada?')) {
      this.notificationService.showLoading('Procesando...', 'Marcando como reclamado');
      this.recompensaService.marcarCanjeReclamado(id).subscribe({
        next: (response: any) => {
          this.notificationService.hideLoading();
          if (response && response.succeeded) {
            this.notificationService.success('Éxito', 'Recompensa marcada como entregada.');
            this.cargarHistorial();
          } else {
            this.notificationService.error('Error', response?.message || 'No se pudo actualizar el estado.');
          }
        },
        error: (err: any) => {
          this.notificationService.hideLoading();
          console.error(err);
          this.notificationService.error('Error', 'Ocurrió un error al actualizar el estado.');
        }
      });
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
    const headers = ['Usuario', 'Email', 'Recompensa Canjeada', 'Puntos', 'Fecha y Hora', 'Código', 'Estado'];
    const data = this.listaCanjesFiltrada.map(c => [
      c.usuarioNombre,
      c.usuarioEmail,
      c.recompensaNombre,
      `${c.puntosUsados} Pts`,
      new Date(c.fecha).toLocaleString(),
      c.codigoCanje || '-',
      c.reclamado ? 'Reclamado' : 'Pendiente'
    ]);
    this.exportService.exportToPDF('Historial de Recompensas', headers, data, 'historial_recompensas.pdf');
  }

  exportarExcel(): void {
    const headers = ['Usuario', 'Email', 'Recompensa Canjeada', 'Puntos', 'Fecha y Hora', 'Código', 'Estado'];
    const data = this.listaCanjesFiltrada.map(c => [
      c.usuarioNombre,
      c.usuarioEmail,
      c.recompensaNombre,
      c.puntosUsados,
      new Date(c.fecha).toLocaleString(),
      c.codigoCanje || '-',
      c.reclamado ? 'Reclamado' : 'Pendiente'
    ]);
    this.exportService.exportToExcel('Historial de Recompensas', headers, data, 'historial_recompensas.xlsx');
  }
}
