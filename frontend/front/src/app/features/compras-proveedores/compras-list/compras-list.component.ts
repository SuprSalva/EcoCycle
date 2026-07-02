import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompraService } from '../../../core/services/compra.service';
import { CompraProveedor } from '../../../models/compra-proveedor.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './compras-list.component.html',
  styleUrls: ['./compras-list.component.scss']
})
export class ComprasListComponent implements OnInit {
  compras: CompraProveedor[] = [];
  cargando = true;

  constructor(private compraService: CompraService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.cargando = true;
    this.compraService.getCompras().subscribe({
      next: (res: any) => {
        this.compras = res.data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar las compras', 'error');
      }
    });
  }

  verDetalles(compra: CompraProveedor): void {
    let html = `<ul class="list-group text-start">`;
    compra.detalles.forEach((d: any) => {
      html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                  ${d.nombreMateriaPrima} (x${d.cantidad})
                  <span class="badge bg-primary rounded-pill">$${d.precioUnitario * d.cantidad}</span>
               </li>`;
    });
    html += `</ul><div class="mt-3 text-end fw-bold">Total: $${compra.total}</div>`;

    Swal.fire({
      title: `Detalles de Compra - ${compra.proveedorNombre}`,
      html: html,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }
}
