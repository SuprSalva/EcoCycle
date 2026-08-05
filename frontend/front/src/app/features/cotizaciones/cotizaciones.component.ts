import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cotizacion } from '../../models/cotizacion.model';
import { CotizacionesService } from '../../core/services/cotizaciones.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.scss']
})
export class CotizacionesComponent implements OnInit {

  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Cotizacion[] = [];

  cargando = true;

  filtroEstado = 'Todas';
  filtroBusqueda = '';

  countTodas = 0;
  countPendientes = 0;
  countContactadas = 0;
  countAceptadas = 0;
  countRechazadas = 0;

  cotizacionSeleccionada: Cotizacion | null = null;
  mostrarDetalle = false;

  constructor(
    private cotizacionesService: CotizacionesService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarCotizaciones();
  }

  cargarCotizaciones(): void {

    this.cargando = true;

    this.cotizacionesService.obtenerTodas().subscribe({

      next: (data) => {

        this.cargando = false;

        this.cotizaciones = data ?? [];

        this.calcularContadores();

        this.aplicarFiltro();

      },

      error: (error) => {

        console.error(error);

        this.cargando = false;

        this.notificationService.error(
          'Error',
          'No se pudieron cargar las cotizaciones.'
        );

      }

    });

  }

  calcularContadores(): void {

    this.countTodas = this.cotizaciones.length;

    this.countPendientes =
      this.cotizaciones.filter(x => x.estatus === 'Pendiente').length;

    this.countContactadas =
      this.cotizaciones.filter(x => x.estatus === 'Contactado').length;

    this.countAceptadas =
      this.cotizaciones.filter(x => x.estatus === 'Aceptada').length;

    this.countRechazadas =
      this.cotizaciones.filter(x => x.estatus === 'Rechazada').length;

  }

  aplicarFiltro(): void {

    let resultado = [...this.cotizaciones];

    if (this.filtroEstado !== 'Todas') {

      resultado = resultado.filter(
        x => x.estatus === this.filtroEstado
      );

    }

    if (this.filtroBusqueda.trim()) {

      const term = this.filtroBusqueda.toLowerCase();

      resultado = resultado.filter(x =>

        x.nombre.toLowerCase().includes(term) ||

        x.empresa?.toLowerCase().includes(term) ||

        x.correo.toLowerCase().includes(term) ||

        x.ciudad.toLowerCase().includes(term) ||

        x.estado.toLowerCase().includes(term)

      );

    }

    this.cotizacionesFiltradas = resultado;

  }

  aplicarBusqueda(): void {
    this.aplicarFiltro();
  }

  cambiarFiltro(estado: string): void {

    this.filtroEstado = estado;

    this.aplicarFiltro();

  }

  verDetalle(cotizacion: Cotizacion): void {

    this.cotizacionSeleccionada = cotizacion;

    this.mostrarDetalle = true;

  }

  cerrarDetalle(): void {

    this.cotizacionSeleccionada = null;

    this.mostrarDetalle = false;

  }

  cambiarEstatus(cotizacion: Cotizacion, nuevoEstatus: string): void {

    if (!cotizacion.id) {
      return;
    }

    this.notificationService.confirmAction(
      'Actualizar estatus',
      `¿Deseas cambiar el estatus a "${nuevoEstatus}"?`,
      'Sí, actualizar',
      '#0D631B'
    ).then((result: any) => {

      if (!result.isConfirmed) {
        return;
      }

      this.notificationService.showLoading(
        'Actualizando...',
        'Guardando cambios'
      );

      this.cotizacionesService.actualizarEstatus(
        cotizacion.id!,
        nuevoEstatus
      ).subscribe({

        next: () => {

          this.notificationService.hideLoading();

          cotizacion.estatus = nuevoEstatus;

          this.calcularContadores();

          this.aplicarFiltro();

          this.notificationService.toastSuccess(
            'Estatus actualizado correctamente.'
          );

        },

        error: (error) => {

          console.error(error);

          this.notificationService.hideLoading();

          this.notificationService.error(
            'Error',
            'No fue posible actualizar el estatus.'
          );

        }

      });

    });

  }

  getEstadoClass(estado?: string): string {

    switch (estado) {

      case 'Pendiente':
        return 'bg-warning text-dark';

      case 'Contactado':
        return 'bg-info';

      case 'Aceptada':
        return 'bg-success';

      case 'Rechazada':
        return 'bg-danger';

      default:
        return 'bg-secondary';

    }

  }

  getEstadoIcon(estado?: string): string {

    switch (estado) {

      case 'Pendiente':
        return 'fa-clock';

      case 'Contactado':
        return 'fa-phone';

      case 'Aceptada':
        return 'fa-check-circle';

      case 'Rechazada':
        return 'fa-times-circle';

      default:
        return 'fa-question-circle';

    }

  }

}