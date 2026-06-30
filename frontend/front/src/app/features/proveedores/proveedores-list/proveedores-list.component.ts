import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { Proveedor } from '../../../models/proveedor.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './proveedores-list.component.html',
  styleUrls: ['./proveedores-list.component.scss']
})
export class ProveedoresListComponent implements OnInit {
  proveedores: Proveedor[] = [];
  cargando = true;

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.cargando = true;
    this.proveedorService.getProveedores().subscribe({
      next: (res: any) => {
        this.proveedores = res.data;
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
      }
    });
  }

  eliminarProveedor(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.proveedorService.eliminarProveedor(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El proveedor ha sido eliminado.', 'success');
            this.cargarProveedores();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el proveedor', 'error');
          }
        });
      }
    });
  }
}
