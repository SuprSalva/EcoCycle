import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecetasService } from '../../core/services/recetas.service';
import { Receta } from '../../models/receta.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent implements OnInit {
  // Variables de control de estado
  recetas: Receta[] = [];
  cargando = true;

  searchTerm: string = '';
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  constructor(private recetasService: RecetasService) {}

  ngOnInit(): void {
    this.cargarRecetas();
  }

  cargarRecetas(): void {
    this.cargando = true;
    this.recetasService.obtenerTodas().subscribe({
      next: (res: Receta[]) => {

        this.recetas = res;
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar las recetas', 'error');
      }
    });
  }

  cambiarItemsPorPagina(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(target.value);
  }
  cambiarEstatus(receta: Receta): void {

    if (!receta.id) return;
  
    const nuevoEstatus = !receta.activo;
  
    Swal.fire({
      title: nuevoEstatus
        ? '¿Activar receta?'
        : '¿Desactivar receta?',
      text: nuevoEstatus
        ? 'La receta volverá a estar disponible.'
        : 'La receta dejará de estar disponible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: nuevoEstatus
        ? 'Sí, activar'
        : 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#dc3545',
      reverseButtons: true
    }).then(result => {
  
      if (!result.isConfirmed) {
        return;
      }
  
      this.recetasService.actualizarEstatus(receta.id!, nuevoEstatus).subscribe({
        next: () => {
          receta.activo = nuevoEstatus;
  
          Swal.fire({
            title: '¡Actualizado!',
            text: `La receta ha sido ${nuevoEstatus ? 'activada' : 'desactivada'} correctamente.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el estado de la receta.',
            icon: 'error',
            confirmButtonColor: '#2563eb'
          });
        }
      });
  
    });
  
  }

  eliminarReceta(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.recetasService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La receta ha sido eliminada.', 'success');
            this.cargarRecetas();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la receta', 'error');
          }
        });
      }
    });
  }
}