import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../core/services/productos.service';
import { 
  Producto,
  CrearProductoCompletoRequest,
  ProductoCompletoResponse
 } from '../../models/producto.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-productos.component.html',
  styleUrls: ['./admin-productos.component.scss']
})
export class AdminProductosComponent implements OnInit {

  productos: Producto[] = [];
  cargando: boolean = false;
  productoDetalle?: ProductoCompletoResponse;
  searchTerm: string = '';


  constructor(
    private productosService: ProductosService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.cargarProductos();
  }


  verDetalleProducto(id: string): void {

    this.productosService
      .obtenerProductoCompleto(id)
      .subscribe({
  
        next: (producto) => {
  
          this.productoDetalle = producto;
  
  
          let ingredientes = producto.insumos
            .map(i => 
              `
              <tr>
                <td>${i.nombreMateriaPrima}</td>
                <td>${i.cantidad}</td>
                <td>${i.unidadMedida}</td>
              </tr>
              `
            )
            .join('');
  
  
  
            Swal.fire({

              title: '',
            
              width: 750,
            
              html: `
            
              <div class="producto-detalle-modal">
            
            
                <!-- Encabezado -->
                <div class="detalle-header">
            
                  <div class="icon-producto">
                    <i class="fa-solid fa-box-open"></i>
                  </div>
            
            
                  <div>
            
                    <h3>
                      ${producto.nombre}
                    </h3>
            
                    <span class="badge 
                      ${producto.activo ? 'activo' : 'inactivo'}">
            
                      ${producto.activo ? 'Activo' : 'Inactivo'}
            
                    </span>
            
                  </div>
            
                </div>
            
            
            
                <!-- Información producto -->
            
                <div class="detalle-card">
            
                  <h5>
                    <i class="fa-solid fa-circle-info"></i>
                    Información del producto
                  </h5>
            
            
                  <div class="detalle-row">
            
                    <strong>
                      Descripción:
                    </strong>
            
                    <span>
                      ${producto.descripcion || 'Sin descripción'}
                    </span>
            
                  </div>
            
            
                </div>
            
            
            
            
                <!-- Receta -->
            
                <div class="detalle-card">
            
                  <h5>
                    <i class="fa-solid fa-book-open"></i>
                    Información de receta
                  </h5>
            
            
                  <div class="detalle-grid">
            
            
                    <div>
            
                      <small>
                        Tiempo estimado
                      </small>
            
                      <p>
                        ${producto.tiempoEstimadoMinutos} minutos
                      </p>
            
                    </div>
            
            
            
                    <div>
            
                      <small>
                        Ingredientes
                      </small>
            
                      <p>
                        ${producto.insumos.length}
                      </p>
            
                    </div>
            
            
            
                  </div>
            
            
                </div>
            
            
            
            
            
                <!-- Ingredientes -->
            
                <div class="detalle-card">
            
            
                  <h5>
            
                    <i class="fa-solid fa-list-check"></i>
            
                    Ingredientes
            
                  </h5>
            
            
            
                  <div class="tabla-container">
            
            
                  <table class="tabla-insumos">
            
            
                    <thead>
            
                      <tr>
            
                        <th>
                          Materia Prima
                        </th>
            
                        <th>
                          Cantidad
                        </th>
            
                        <th>
                          Unidad
                        </th>
            
                      </tr>
            
                    </thead>
            
            
                    <tbody>
            
                    ${
                      producto.insumos.map(i => `
            
                      <tr>
            
                        <td>
                          ${i.nombreMateriaPrima}
                        </td>
            
            
                        <td>
                          ${i.cantidad}
                        </td>
            
            
                        <td>
                          ${i.unidadMedida}
                        </td>
            
            
                      </tr>
            
                      `).join('')
                    }
            
            
                    </tbody>
            
            
                  </table>
            
            
                  </div>
            
            
                </div>
            
            
            
              </div>
            
            
              `,
            
            
              showConfirmButton:true,
            
              confirmButtonText:
                '<i class="fa-solid fa-check"></i> Cerrar',
            
            
              customClass: {
            
                popup:
                  'producto-popup',
            
                confirmButton:
                  'btn-cerrar-modal'
            
              },
            
            
              buttonsStyling:false,
            
            
              didOpen:()=>{
            
                const style = document.createElement('style');
            
                style.innerHTML = `
            
            
            
                .producto-popup{
            
                  border-radius:24px!important;
                  padding:25px!important;
            
                }
            
            
            
                .producto-detalle-modal{
            
                  text-align:left;
            
                  font-family:
                  "Segoe UI", sans-serif;
            
                }
            
            
            
            
                .detalle-header{
            
                  display:flex;
            
                  align-items:center;
            
                  gap:18px;
            
                  padding-bottom:20px;
            
                  border-bottom:
                  1px solid #eee;
            
                  margin-bottom:20px;
            
                }
            
            
            
                .icon-producto{
            
                  width:65px;
            
                  height:65px;
            
                  border-radius:18px;
            
                  background:#2563eb;
            
                  color:white;
            
                  display:flex;
            
                  align-items:center;
            
                  justify-content:center;
            
                  font-size:28px;
            
                }
            
            
            
            
                .detalle-header h3{
            
                  margin:0;
            
                  font-weight:700;
            
                  color:#1e293b;
            
                }
            
            
            
            
                .badge{
            
                  display:inline-block;
            
                  margin-top:8px;
            
                  padding:5px 14px;
            
                  border-radius:20px;
            
                  font-size:13px;
            
                  font-weight:600;
            
                }
            
            
            
                .activo{
            
                  background:#dcfce7;
            
                  color:#15803d;
            
                }
            
            
            
                .inactivo{
            
                  background:#fee2e2;
            
                  color:#b91c1c;
            
                }
            
            
            
            
                .detalle-card{
            
                  background:#f8fafc;
            
                  border-radius:18px;
            
                  padding:18px;
            
                  margin-bottom:15px;
            
                }
            
            
            
            
                .detalle-card h5{
            
                  font-size:16px;
            
                  font-weight:700;
            
                  color:#334155;
            
                  margin-bottom:15px;
            
                }
            
            
            
            
                .detalle-card h5 i{
            
                  color:#2563eb;
            
                  margin-right:8px;
            
                }
            
            
            
            
                .detalle-row{
            
                  display:flex;
            
                  gap:10px;
            
                  color:#475569;
            
                }
            
            
            
            
                .detalle-grid{
            
                  display:grid;
            
                  grid-template-columns:
                  repeat(2,1fr);
            
                  gap:15px;
            
                }
            
            
            
                .detalle-grid div{
            
                  background:white;
            
                  padding:12px;
            
                  border-radius:12px;
            
                }
            
            
            
                .detalle-grid small{
            
                  color:#64748b;
            
                  font-weight:600;
            
                }
            
            
            
                .detalle-grid p{
            
                  margin:5px 0 0;
            
                  font-size:18px;
            
                  font-weight:700;
            
                  color:#1e293b;
            
                }
            
            
            
            
                .tabla-container{
            
                  overflow:hidden;
            
                  border-radius:12px;
            
                }
            
            
            
            
                .tabla-insumos{
            
                  width:100%;
            
                  border-collapse:collapse;
            
                  background:white;
            
                }
            
            
            
                .tabla-insumos th{
            
                  background:#eff6ff;
            
                  padding:12px;
            
                  font-size:13px;
            
                  color:#334155;
            
                }
            
            
            
                .tabla-insumos td{
            
                  padding:12px;
            
                  border-bottom:
                  1px solid #f1f5f9;
            
                  color:#475569;
            
                }
            
            
            
                .btn-cerrar-modal{
            
                  background:#2563eb!important;
            
                  color:white!important;
            
                  border-radius:50px!important;
            
                  padding:10px 25px!important;
            
                  font-weight:600!important;
            
                }
            
            
            
                `;
            
            
                document.head.appendChild(style);
            
              }
            
            
            });
  
        },
  
  
        error:(err)=>{
  
          console.error(
            'Error obteniendo detalle:',
            err
          );
  
  
          Swal.fire(
            'Error',
            'No se pudo cargar la información del producto.',
            'error'
          );
  
        }
  
      });
  
  
  }

  // Ir al formulario para crear producto completo
  irANuevoProducto(): void {

    this.router.navigate([
      '/admin/admin-productos-form'
    ]);

  }


  // Ir al formulario para editar producto completo
  editarProducto(id?: string): void {

    if (!id) return;

    this.router.navigate([
      '/admin/admin-productos-form',
      id
    ]);

  }



  get productosFiltrados(): Producto[] {

    if (!this.searchTerm.trim()) {
      return this.productos;
    }

    const termino = this.searchTerm.toLowerCase();


    return this.productos.filter(p =>
      p.nombre.toLowerCase().includes(termino) ||
      (p.descripcion ?? '').toLowerCase().includes(termino)
    );

  }



  // Cargar productos
  cargarProductos(): void {

    this.cargando = true;


    this.productosService.obtenerTodos()
      .subscribe({

        next: (data) => {

          this.productos = data;
          this.cargando = false;

        },


        error: (err) => {

          console.error(
            'Error al cargar productos:',
            err
          );

          this.cargando = false;


          Swal.fire(
            'Error',
            'No se pudieron cargar los productos.',
            'error'
          );

        }

      });

  }



  // Activar / Desactivar producto
  toggleEstatus(producto: Producto, event: Event): void {

    event.stopPropagation();


    if (!producto.id) return;


    const nuevoEstado = !producto.activo;


    Swal.fire({

      title: nuevoEstado
        ? '¿Activar producto?'
        : '¿Desactivar producto?',


      text: nuevoEstado
        ? 'El producto volverá a estar disponible.'
        : 'El producto dejará de estar disponible.',


      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: nuevoEstado
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


      this.productosService
        .actualizarEstatus(
          producto.id!,
          nuevoEstado
        )
        .subscribe({

          next: () => {


            producto.activo = nuevoEstado;


            Swal.fire({

              title: 'Actualizado',

              text:
              `Producto ${
                nuevoEstado
                ? 'activado'
                : 'desactivado'
              } correctamente.`,

              icon: 'success',

              timer: 1500,

              showConfirmButton: false

            });


          },


          error: () => {


            Swal.fire(

              'Error',

              'No se pudo actualizar el estado del producto.',

              'error'

            );


          }

        });


    });


  }



  // Eliminar producto
  eliminarProducto(id?: string): void {

    if (!id) return;


    Swal.fire({

      title: '¿Eliminar producto?',

      text: 'Esta acción no se puede deshacer.',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Sí, eliminar',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#dc3545',

      cancelButtonColor: '#6c757d'

    }).then(result => {


      if (!result.isConfirmed) {
        return;
      }


      this.productosService
        .eliminar(id)
        .subscribe({

          next: () => {


            Swal.fire(

              'Eliminado',

              'El producto fue eliminado correctamente.',

              'success'

            );


            this.cargarProductos();


          },


          error: () => {


            Swal.fire(

              'Error',

              'No se pudo eliminar el producto.',

              'error'

            );


          }

        });


    });


  }


}