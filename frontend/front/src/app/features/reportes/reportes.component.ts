import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ReporteService } from '../../core/services/reporte.service';
import { NotificationService } from '../../core/services/notification.service';

export interface Reporte {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  mensaje: string;
  estado: string;
  respuesta?: string;
  fechaEnvio: string;
}

@Component({
  selector: 'app-reportes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  reportes: Reporte[] = [];

  cargando = false;

  // Buscador
  searchTerm = '';

  // Filtro
  filtroEstado = 'Todos';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private reporteService: ReporteService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.obtenerReportes();
  }

  obtenerReportes(): void {

    this.cargando = true;

    this.notificationService.showLoading(
      'Cargando...',
      'Obteniendo reportes'
    );

    this.reporteService.obtenerReportes().subscribe({
      next: (response: any) => {

        this.notificationService.hideLoading();
    
        console.log(response);
    
        this.reportes = response;
    
        this.cargando = false;
    
    },      error: (err) => {

        this.notificationService.hideLoading();

        console.error(err);

        this.cargando = false;

        this.notificationService.error(
          'Error',
          'No fue posible cargar los reportes.'
        );

      }

    });

  }

  get reportesFiltrados(): Reporte[] {

    return this.reportes.filter(r => {

      const coincideBusqueda =

        !this.searchTerm ||

        r.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||

        r.apellidos.toLowerCase().includes(this.searchTerm.toLowerCase()) ||

        r.correo.toLowerCase().includes(this.searchTerm.toLowerCase());

      const coincideEstado =

        this.filtroEstado === 'Todos'

        ||

        r.estado === this.filtroEstado;

      return coincideBusqueda && coincideEstado;

    });

  }

  get reportesPaginados(): Reporte[] {

    const inicio =

      (this.currentPage - 1)

      *

      this.itemsPerPage;

    return this.reportesFiltrados.slice(

      inicio,

      inicio + this.itemsPerPage

    );

  }

  get totalPages(): number {

    return Math.ceil(

      this.reportesFiltrados.length

      /

      this.itemsPerPage

    ) || 1;

  }

  anteriorPagina(): void {

    if (this.currentPage > 1)

      this.currentPage--;

  }

  siguientePagina(): void {

    if (this.currentPage < this.totalPages)

      this.currentPage++;

  }

  limpiarFiltros(): void {

    this.searchTerm = '';

    this.filtroEstado = 'Todos';

    this.currentPage = 1;

  }

  refrescar(): void {

    this.obtenerReportes();

  }


  verDetallesReporte(reporte: Reporte): void {

    Swal.fire({
  
      title: 'Detalle del Reporte',
  
      width: 700,
  
      html: `
  
  <div class="text-start" style="font-family: inherit; color: #1e293b;">
    
    <div class="row g-3 mb-4">
      <div class="col-6">
        <span class="text-muted small d-block uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Nombre</span>
        <span class="fw-semibold text-dark" style="font-size: 0.95rem;">
          <i class="fa-solid fa-user me-2 text-muted" style="font-size: 0.85rem;"></i>${reporte.nombre} ${reporte.apellidos}
        </span>
      </div>
      
      <div class="col-6">
        <span class="text-muted small d-block uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Fecha</span>
        <span class="text-secondary" style="font-size: 0.9rem;">
          <i class="fa-solid fa-calendar me-2 text-muted" style="font-size: 0.85rem;"></i>${new Date(reporte.fechaEnvio).toLocaleString([], {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>

      <div class="col-6">
        <span class="text-muted small d-block uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Correo</span>
        <span class="text-dark" style="font-size: 0.9rem;">
          <i class="fa-solid fa-envelope me-2 text-muted" style="font-size: 0.85rem;"></i>${reporte.correo}
        </span>
      </div>

      <div class="col-6">
        <span class="text-muted small d-block uppercase fw-bold" style="font-size: 0.75rem; letter-spacing: 0.05em;">Teléfono</span>
        <span class="text-dark" style="font-size: 0.9rem;">
          <i class="fa-solid fa-phone me-2 text-muted" style="font-size: 0.85rem;"></i>${reporte.telefono || 'N/A'}
        </span>
      </div>
    </div>

    <div class="mb-4">
      <span class="text-muted small d-block uppercase fw-bold mb-2" style="font-size: 0.75rem; letter-spacing: 0.05em;">Mensaje Recibido</span>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; font-size: 0.9rem; color: #334155; line-height: 1.5;">
        ${reporte.mensaje}
      </div>
    </div>

    <hr style="border-color: #e2e8f0; opacity: 0.6; margin: 1.5rem 0;">

    <div class="mb-3">
      <label for="estadoReporte" class="form-label text-dark fw-bold mb-2" style="font-size: 0.85rem;">
        <i class="fa-solid fa-circle-info me-1 text-muted"></i> Actualizar Estado
      </label>
      <select id="estadoReporte" class="form-select text-dark fw-medium" 
              style="font-size: 0.9rem; border-radius: 10px; border-color: #cbd5e1; height: 42px; background-color: #ffffff; cursor: pointer; box-shadow: none;">
        <option value="Pendiente" ${reporte.estado == "Pendiente" ? "selected" : ""}>Pendiente</option>
        <option value="En Revisión" ${reporte.estado == "En Revisión" ? "selected" : ""}>En Revisión</option>
        <option value="Resuelto" ${reporte.estado == "Resuelto" ? "selected" : ""}>Resuelto</option>
      </select>
    </div>

    <div class="mb-2">
      <label for="respuestaReporte" class="form-label text-dark fw-bold mb-2" style="font-size: 0.85rem;">
        <i class="fa-solid fa-reply me-1 text-muted"></i> Redactar Respuesta / Notas
      </label>
      <textarea id="respuestaReporte" class="form-control" rows="3"
                placeholder="Escribe la resolución o respuesta para el usuario..."
                style="font-size: 0.9rem; border-radius: 12px; border-color: #cbd5e1; padding: 12px; color: #334155; resize: none; box-shadow: none;">${reporte.respuesta ?? ''}</textarea>
    </div>

  </div>
`,
  
      showCancelButton:true,
  
      confirmButtonText:'Guardar',
  
      cancelButtonText:'Cancelar',
  
      confirmButtonColor:'#10b981',
  
      preConfirm:()=>{
  
        return{
  
          estado:(document.getElementById('estadoReporte') as HTMLSelectElement).value,
  
          respuesta:(document.getElementById('respuestaReporte') as HTMLTextAreaElement).value
  
        };
  
      }
  
    }).then(result=>{
  
      if(!result.isConfirmed) return;
  
      this.notificationService.showLoading(
  
        'Guardando...',
  
        'Actualizando reporte'
  
      );
  
      this.reporteService.actualizarReporte(
  
        reporte.id,
  
        {
  
          estado:result.value.estado,
  
          respuesta:result.value.respuesta
  
        }
  
      ).subscribe({
  
        next: (response: any) => {

          this.notificationService.hideLoading();
        
          this.notificationService.success(
            'Éxito',
            response.mensaje || 'Reporte actualizado correctamente.'
          );
        
          this.obtenerReportes();
        
        },
  
        error:(err)=>{
  
          console.error(err);
  
          this.notificationService.hideLoading();
  
          this.notificationService.error(
  
            'Error',
  
            'No fue posible actualizar el reporte.'
  
          );
  
        }
  
      });
  
    });
  
  }

}