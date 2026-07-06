import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 Agregado para que funcione el [(ngModel)] del buscador
import { CompraService } from '../../../core/services/compra.service';
import { CompraProveedor } from '../../../models/compra-proveedor.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule], // 👈 Incluido aquí
  templateUrl: './compras-list.component.html',
  styleUrls: ['./compras-list.component.scss']
})
export class ComprasListComponent implements OnInit {
  compras: CompraProveedor[] = [];
  cargando = true;

  // 🔍 Variables de Control para Filtros y Paginación
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private compraService: CompraService) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  // 📥 Carga de datos desde el servicio
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

  /**
   * 🔥 GETTER 1: Filtra el arreglo base por el buscador de proveedores
   */
  get comprasFiltradas(): CompraProveedor[] {
    if (!this.searchTerm.trim()) {
      return this.compras;
    }
    const search = this.searchTerm.toLowerCase().trim();
    return this.compras.filter(c => 
      c.proveedorNombre?.toLowerCase().includes(search)
    );
  }

  /**
   * 🥞 GETTER 2: Corta el arreglo filtrado para la página activa
   */
  get comprasPaginadas(): CompraProveedor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.comprasFiltradas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  /**
   * 🔢 GETTER 3: Calcula el total de páginas
   */
  get totalPages(): number {
    return Math.ceil(this.comprasFiltradas.length / this.itemsPerPage) || 1;
  }

  // 🎛️ Controles de Paginación
  anteriorPagina() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  siguientePagina() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // 👁️ Abre el modal con el desglose de productos usando SweetAlert2
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
      confirmButtonText: 'Cerrar',
      confirmButtonColor: 'var(--primary-color, #10b981)' // Para que combine con tus estilos modernos
    });
  }
}