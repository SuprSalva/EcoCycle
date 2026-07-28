import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ProduccionService } from '../../core/services/produccion.service';
import { ProductosService } from '../../core/services/productos.service';
import { Produccion, CrearProduccionRequest } from '../../models/produccion.model';
import { Producto, ProductoCompletoResponse } from '../../models/producto.model';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produccion.component.html',
  styleUrls: ['./produccion.component.scss']
})
export class ProduccionComponent implements OnInit {

  producciones: Produccion[] = [];
  productos: Producto[] = [];
  cargando = false;
  searchTerm = '';

  // Formulario "Nueva Producción"
  mostrarModal = false;
  guardando = false;
  productoId = '';
  cantidad = 1;
  observaciones = '';
  detalleProducto?: ProductoCompletoResponse;
  cargandoReceta = false;

  constructor(
    private produccionService: ProduccionService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    this.cargarProducciones();
    this.cargarProductos();
  }

  cargarProducciones(): void {
    this.cargando = true;
    this.produccionService.obtenerTodas().subscribe({
      next: (data) => { this.producciones = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  cargarProductos(): void {
    this.productosService.obtenerTodos().subscribe({
      next: (data) => { this.productos = data.filter(p => p.activo); },
      error: () => { }
    });
  }

  get produccionesFiltradas(): Produccion[] {
    const t = this.searchTerm.trim().toLowerCase();
    if (!t) return this.producciones;
    return this.producciones.filter(p => (p.nombreProducto || '').toLowerCase().includes(t));
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.productoId = '';
    this.cantidad = 1;
    this.observaciones = '';
    this.detalleProducto = undefined;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  onProductoChange(): void {
    this.detalleProducto = undefined;
    if (!this.productoId) return;

    this.cargandoReceta = true;
    this.productosService.obtenerProductoCompleto(this.productoId).subscribe({
      next: (res) => { this.detalleProducto = res; this.cargandoReceta = false; },
      error: () => { this.cargandoReceta = false; }
    });
  }

  // Materia prima requerida = cantidad de la receta x unidades a producir.
  get materialesRequeridos() {
    if (!this.detalleProducto) return [];
    const q = this.cantidad > 0 ? this.cantidad : 0;
    return this.detalleProducto.insumos.map(i => ({
      nombre: i.nombreMateriaPrima,
      cantidad: i.cantidad * q,
      unidad: i.unidadMedida
    }));
  }

  registrarProduccion(): void {
    if (!this.productoId) {
      Swal.fire('Atención', 'Selecciona un producto a producir.', 'warning');
      return;
    }
    if (!this.cantidad || this.cantidad <= 0) {
      Swal.fire('Atención', 'La cantidad a producir debe ser mayor a cero.', 'warning');
      return;
    }

    this.guardando = true;
    const request: CrearProduccionRequest = {
      productoId: this.productoId,
      cantidad: Number(this.cantidad),
      observaciones: this.observaciones?.trim() || undefined
    };

    this.produccionService.crear(request).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarModal = false;
        Swal.fire({
          icon: 'success',
          title: 'Producción registrada',
          text: 'Se descontó la materia prima del inventario.',
          timer: 1800,
          showConfirmButton: false
        });
        this.cargarProducciones();
      },
      error: (err) => {
        this.guardando = false;
        Swal.fire(
          'No se pudo registrar',
          err.error?.mensaje || 'Ocurrió un error al registrar la producción.',
          'error'
        );
      }
    });
  }

  verDetalle(p: Produccion): void {
    const filas = (p.materialesConsumidos || []).map(m => `
      <tr>
        <td style="text-align:left;padding:8px;border-bottom:1px solid #f1f5f9;">${m.nombre}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;">${m.cantidad} ${m.unidad}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;">$${(m.costoUnitario || 0).toFixed(2)}</td>
      </tr>`).join('');

    Swal.fire({
      title: p.nombreProducto,
      width: 640,
      html: `
        <div style="text-align:left;font-family:'Segoe UI',sans-serif;">
          <p style="margin:4px 0;"><strong>Cantidad producida:</strong> ${p.cantidad}</p>
          <p style="margin:4px 0;"><strong>Costo total:</strong> $${(p.costoTotal || 0).toFixed(2)}</p>
          <p style="margin:4px 0;"><strong>Fecha:</strong> ${new Date(p.fecha).toLocaleString()}</p>
          ${p.observaciones ? `<p style="margin:4px 0;"><strong>Observaciones:</strong> ${p.observaciones}</p>` : ''}
          <h6 style="margin-top:16px;font-weight:700;">Materia prima consumida</h6>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#ecfdf5;">
                <th style="text-align:left;padding:8px;">Material</th>
                <th style="padding:8px;">Cantidad</th>
                <th style="padding:8px;">Costo unit.</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>`,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Cerrar'
    });
  }
}
