import { Component, OnInit, HostListener } from '@angular/core';
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

  // Estados posibles de una producción y menú de cambio de estado por fila.
  estados = ['Completada', 'En proceso', 'Cancelada'];
  estadoMenuAbiertoId: string | null = null;
  estadoMenuProd: Produccion | null = null;
  estadoMenuPos = { top: 0, left: 0 };

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

  // Colores del badge/menú según el estado de la producción.
  estadoEstilo(estado: string): { bg: string; color: string } {
    switch (estado) {
      case 'Completada': return { bg: '#e6f4ea', color: '#137333' };
      case 'En proceso': return { bg: '#fef7e0', color: '#b06000' };
      case 'Cancelada':  return { bg: '#fce8e6', color: '#c5221f' };
      default:           return { bg: '#eef2f7', color: '#5f6368' };
    }
  }

  toggleEstadoMenu(p: Produccion, event: MouseEvent): void {
    event.stopPropagation();
    if (this.estadoMenuAbiertoId === p.id) {
      this.cerrarEstadoMenu();
      return;
    }

    // El menú se renderiza fuera de la tabla (position: fixed) para no recortarse.
    // Calculamos su posición a partir del botón, abriendo hacia arriba si no cabe abajo.
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const menuAncho = 190;
    const menuAlto = 140;

    let top = rect.bottom + 6;
    if (top + menuAlto > window.innerHeight) {
      top = rect.top - 6 - menuAlto;
    }
    let left = Math.min(rect.left, window.innerWidth - menuAncho - 8);
    left = Math.max(8, left);

    this.estadoMenuPos = { top, left };
    this.estadoMenuProd = p;
    this.estadoMenuAbiertoId = p.id;
  }

  cerrarEstadoMenu(): void {
    this.estadoMenuAbiertoId = null;
    this.estadoMenuProd = null;
  }

  // El menú flotante se ancla al botón; si la vista cambia, se cierra para no quedar desalineado.
  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.estadoMenuAbiertoId) this.cerrarEstadoMenu();
  }

  cambiarEstado(p: Produccion, nuevoEstado: string, event: Event): void {
    event.stopPropagation();
    this.cerrarEstadoMenu();
    if (p.estado === nuevoEstado) return;

    // Las transiciones que tocan el inventario se confirman antes de aplicarse.
    if (nuevoEstado === 'Cancelada') {
      Swal.fire({
        icon: 'warning',
        title: '¿Cancelar producción?',
        text: 'Se devolverá la materia prima consumida al inventario.',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No',
        confirmButtonColor: '#c5221f'
      }).then(r => { if (r.isConfirmed) this.aplicarCambioEstado(p, nuevoEstado); });
    } else if (p.estado === 'Cancelada') {
      Swal.fire({
        icon: 'warning',
        title: '¿Reactivar producción?',
        text: 'Se volverá a descontar la materia prima del inventario.',
        showCancelButton: true,
        confirmButtonText: 'Sí, reactivar',
        cancelButtonText: 'No',
        confirmButtonColor: '#10B981'
      }).then(r => { if (r.isConfirmed) this.aplicarCambioEstado(p, nuevoEstado); });
    } else {
      this.aplicarCambioEstado(p, nuevoEstado);
    }
  }

  private aplicarCambioEstado(p: Produccion, nuevoEstado: string): void {
    this.produccionService.cambiarEstado(p.id, nuevoEstado).subscribe({
      next: () => {
        p.estado = nuevoEstado;
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: `La producción ahora está "${nuevoEstado}".`,
          timer: 1600,
          showConfirmButton: false
        });
        // Recargar para reflejar los cambios de inventario, si los hubo.
        this.cargarProducciones();
      },
      error: (err) => {
        Swal.fire(
          'No se pudo cambiar el estado',
          err.error?.mensaje || 'Ocurrió un error al cambiar el estado.',
          'error'
        );
      }
    });
  }

  // Escapa texto libre antes de inyectarlo como HTML en el detalle (evita XSS).
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  verDetalle(p: Produccion): void {
    const filas = (p.materialesConsumidos || []).map(m => `
      <tr>
        <td style="text-align:left;padding:8px;border-bottom:1px solid #f1f5f9;">${this.escapeHtml(m.nombre)}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;">${m.cantidad} ${this.escapeHtml(m.unidad)}</td>
        <td style="padding:8px;border-bottom:1px solid #f1f5f9;">$${(m.costoUnitario || 0).toFixed(2)}</td>
      </tr>`).join('');

    const est = this.estadoEstilo(p.estado);

    // Observaciones rediseñadas como nota destacada (con estado vacío incluido).
    const observacionesHtml = p.observaciones
      ? `
        <div style="margin-top:16px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;
                    border-left:4px solid #f59e0b;border-radius:12px;">
          <div style="display:flex;align-items:center;gap:8px;color:#b45309;font-weight:700;
                      font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">
            <i class="fa-solid fa-note-sticky"></i> Observaciones
          </div>
          <div style="color:#374151;font-size:0.95rem;line-height:1.5;white-space:pre-wrap;word-break:break-word;">${this.escapeHtml(p.observaciones)}</div>
        </div>`
      : `
        <div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border:1px dashed #e2e8f0;
                    border-radius:12px;color:#94a3b8;font-size:0.9rem;font-style:italic;">
          <i class="fa-regular fa-note-sticky" style="margin-right:6px;"></i> Sin observaciones registradas.
        </div>`;

    Swal.fire({
      title: p.nombreProducto,
      width: 640,
      html: `
        <div style="text-align:left;font-family:'Segoe UI',sans-serif;">
          <div style="display:flex;flex-wrap:wrap;gap:4px 28px;">
            <p style="margin:4px 0;"><strong>Cantidad producida:</strong> ${p.cantidad}</p>
            <p style="margin:4px 0;"><strong>Costo total:</strong> $${(p.costoTotal || 0).toFixed(2)}</p>
          </div>
          <p style="margin:4px 0;"><strong>Fecha:</strong> ${new Date(p.fecha).toLocaleString()}</p>
          <p style="margin:4px 0;"><strong>Estado:</strong>
            <span style="display:inline-block;padding:2px 12px;border-radius:999px;font-weight:600;
                         font-size:0.85rem;background:${est.bg};color:${est.color};">${this.escapeHtml(p.estado)}</span>
          </p>
          ${observacionesHtml}
          <h6 style="margin-top:18px;font-weight:700;">Materia prima consumida</h6>
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
