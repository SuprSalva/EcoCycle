import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecompensaService, Recompensa } from '../../core/services/recompensa.service';
import { NotificationService } from '../../core/services/notification.service';
import { RecompensaFormComponent } from './recompensa-form/recompensa-form.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RecompensaFormComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  listaRecompensasOriginal: Recompensa[] = [];
  listaRecompensasFiltrada: Recompensa[] = [];
  
  vistaActual: 'lista' | 'formulario' = 'lista';
  recompensaSeleccionada: Recompensa | null = null;
  cargando: boolean = true;

  // Filtros y Búsqueda
  terminoBusqueda: string = '';

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
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.notificationService.showLoading('Cargando catálogo...', 'Sincronizando el catálogo con el servidor');
    this.recompensaService.obtenerTodasAdmin().subscribe({
      next: (response: any) => { 
        if (response && response.succeeded) {
          this.listaRecompensasOriginal = response.data;
        } else {
          this.listaRecompensasOriginal = response?.data || [];
        }
        this.aplicarFiltrosYOrden();
        this.cargando = false;
        this.notificationService.hideLoading();
      },
      error: (err: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        console.error('Error al cargar catálogo:', err);
        this.notificationService.error('Error', 'No se pudieron cargar las recompensas.');
        this.listaRecompensasOriginal = [];
        this.aplicarFiltrosYOrden();
      }
    });
  }

  aplicarFiltrosYOrden(): void {
    let filtrados = [...this.listaRecompensasOriginal];

    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(r => 
        r.nombre?.toLowerCase().includes(termino) ||
        r.descripcion?.toLowerCase().includes(termino)
      );
    }

    this.listaRecompensasFiltrada = filtrados;
    this.totalPaginas = Math.ceil(this.listaRecompensasFiltrada.length / this.itemsPorPagina);
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

  get paginados(): Recompensa[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaRecompensasFiltrada.slice(inicio, fin);
  }

  get resumenPaginacion(): string {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.listaRecompensasFiltrada.length);
    const total = this.listaRecompensasFiltrada.length;
    return total === 0 ? '0 resultados' : `${inicio} - ${fin} de ${total}`;
  }

  crearNuevaRecompensa(): void {
    this.recompensaSeleccionada = null;
    this.vistaActual = 'formulario';
  }

  editarRecompensa(recompensa: Recompensa): void {
    this.recompensaSeleccionada = recompensa;
    this.vistaActual = 'formulario';
  }

  volverALista(): void {
    this.vistaActual = 'lista';
  }

  recargarDespuesDeGuardar(): void {
    this.volverALista();
    this.cargarCatalogo();
  }

  cambiarEstatusRecompensa(recompensa: Recompensa, event: Event): void {
    event.stopPropagation();
    const accion = recompensa.activa ? 'desactivar' : 'activar';
    const nuevaActiva = !recompensa.activa;

    this.notificationService.confirmAction(
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} recompensa?`,
      `¿Estás seguro de que deseas ${accion} "${recompensa.nombre}"?`,
      recompensa.activa ? 'Desactivar' : 'Activar',
      recompensa.activa ? '#ef233c' : '#137333'
    ).then((result) => {
      if (result.isConfirmed) {
        this.notificationService.showLoading('Actualizando...', 'Cambiando el estado de la recompensa');
        this.recompensaService.cambiarEstatus(recompensa.id, nuevaActiva).subscribe({
          next: () => {
            this.notificationService.hideLoading();
            recompensa.activa = nuevaActiva;
            this.notificationService.toastSuccess(`Recompensa ${nuevaActiva ? 'activada' : 'desactivada'} correctamente.`);
          },
          error: (err) => {
            this.notificationService.hideLoading();
            console.error(err);
            this.notificationService.error('Error', 'No se pudo cambiar el estatus de la recompensa.');
          }
        });
      }
    });
  }

  obtenerEmoji(nombre: string): string {
    if (!nombre) return '🎁';
    const n = nombre.toLowerCase();
    if (n.includes('café') || n.includes('cafe')) return '☕';
    if (n.includes('bolsa') || n.includes('mochila')) return '👜';
    if (n.includes('árbol') || n.includes('arbol') || n.includes('planta') || n.includes('semilla')) return '🌲';
    if (n.includes('cine') || n.includes('película') || n.includes('boleto')) return '🎟️';
    if (n.includes('camisa') || n.includes('playera') || n.includes('ropa')) return '👕';
    return '🎁';
  }

  abrirImagen(recompensa: Recompensa, event: Event): void {
    event.stopPropagation(); // Prevenir que se abra el modal de edición al hacer clic en la imagen
    if (recompensa.imagenUrl) {
      this.notificationService.showImage(recompensa.imagenUrl, recompensa.nombre);
    }
  }

  // --- MÉTODOS DE EXPORTACIÓN ---
  exportarPDF(): void {
    const headers = ['Nombre Comercial', 'Descripción', 'Costo (Pts)', 'Stock', 'Estatus'];
    const data = this.listaRecompensasFiltrada.map(r => [
      r.nombre,
      r.descripcion || 'Sin descripción',
      r.costoPuntos.toString(),
      r.stock === -1 ? 'Ilimitado' : r.stock.toString(),
      r.activa ? 'Activa' : 'Inactiva'
    ]);
    this.exportService.exportToPDF('Catálogo Maestro de Recompensas', headers, data, 'recompensas_ecocycle.pdf');
  }

  exportarExcel(): void {
    const headers = ['ID Recompensa', 'Nombre Comercial', 'Descripción', 'Costo en EcoPts', 'Stock Disponible', 'Estatus'];
    const data = this.listaRecompensasFiltrada.map(r => [
      r.id,
      r.nombre,
      r.descripcion || '',
      r.costoPuntos,
      r.stock === -1 ? 'Ilimitado' : r.stock,
      r.activa ? 'Activa' : 'Inactiva'
    ]);
    this.exportService.exportToExcel('Catálogo Maestro de Recompensas', headers, data, 'recompensas_ecocycle.xlsx');
  }
}