import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService, CompraProducto } from '../../../core/services/compra.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-compras.component.html',
  styleUrls: ['./mis-compras.component.scss']
})
export class MisComprasComponent implements OnInit {
  compras: CompraProducto[] = [];
  cargando = true;

  compraSeleccionada: CompraProducto | null = null;
  nuevaOpinion: string = '';
  nuevaCalificacion: number = 5;

  constructor(private compraService: CompraService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras() {
    this.cargando = true;
    this.compraService.obtenerMisCompras().subscribe({
      next: (data: any) => {
        this.compras = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  abrirModalOpinion(compra: CompraProducto) {
    this.compraSeleccionada = compra;
    this.nuevaOpinion = compra.opinion || '';
    this.nuevaCalificacion = compra.calificacion || 5;
  }

  guardarOpinion() {
    if (!this.compraSeleccionada?.id) return;
    
    this.compraService.dejarOpinion(this.compraSeleccionada.id, this.nuevaOpinion, this.nuevaCalificacion).subscribe({
      next: () => {
        Swal.fire('Gracias', 'Tu opinión ha sido registrada', 'success');
        this.compraSeleccionada = null;
        this.cargarCompras();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo registrar la opinión', 'error');
      }
    });
  }

  getEstrellas(calificacion: number): number[] {
    return Array(calificacion).fill(0);
  }
}
