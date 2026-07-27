import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../core/services/productos.service';
import { MateriaPrimaService } from '../../../core/services/materia-prima.service';
import { 
  CrearProductoCompletoRequest, 
  DetalleRecetaInput,
  ProductoCompletoResponse
} from '../../../models/producto.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-productos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-productos-form.component.html',
  styleUrls: ['./admin-productos-form.component.scss']
})
export class ProductoCompletaComponent implements OnInit {

  pasoActual = 1;
  guardando = false;

  formProducto: FormGroup;

  formReceta: FormGroup;

  formInsumo: FormGroup;

  insumos: DetalleRecetaInput[] = [];
  materiasPrimas: any[] = [];

  productoId: string | null = null;
modoEdicion = false;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private materiaPrimaService: MateriaPrimaService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.formProducto = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });

    this.formReceta = this.fb.group({
      tiempoEstimadoMinutos: [
        5,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });

    this.formInsumo = this.fb.group({
      materiaPrimaId: ['', Validators.required],
      nombreMateriaPrima: [''],
      cantidad: [
        1,
        [
          Validators.required,
          Validators.min(0.0001)
        ]
      ],
      unidadMedida: ['g', Validators.required],
      observaciones: ['']
    });

  }
  
  ngOnInit(): void {

    this.cargarMateriasPrimas();
  
    this.productoId =
      this.route.snapshot.paramMap.get('id');
  
    if(this.productoId){
  
      this.modoEdicion = true;
  
      this.cargarProductoCompleto();
    }
  }


  cargarProductoCompleto(): void {
    this.productosService
      .obtenerProductoCompleto(this.productoId!)
      .subscribe({
  
        next:(res: ProductoCompletoResponse)=>{
  
  
          this.formProducto.patchValue({
  
            nombre: res.nombre,
  
            descripcion: res.descripcion
  
          });
  
  
          this.formReceta.patchValue({
  
            tiempoEstimadoMinutos:
              res.tiempoEstimadoMinutos
  
          });
  
  
          this.insumos = res.insumos;
  
  
        },

        error:(err)=>{
  
          console.error(
            'Error cargando producto completo',
            err
          );
  
  
          Swal.fire(
            'Error',
            'No se pudo cargar la información del producto.',
            'error'
          );
  
  
          this.router.navigate([
            '/admin/admin-productos'
          ]);
        }
      });
  
  }
  
  cargarMateriasPrimas(): void {

    this.materiaPrimaService.obtenerTodas().subscribe({

      next: (res: any) => {
        this.materiasPrimas = res.data || res;
      },

      error: (err) => {
        console.error('Error cargando materias primas', err);
      }

    });

  }

  siguientePaso(): void {
    
    if (this.formProducto.invalid) {
      this.formProducto.markAllAsTouched();
      return;
    }
    this.pasoActual = 2;

  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }

  }

  onMateriaPrimaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const mp = this.materiasPrimas.find(
      x => x.id === select.value
    );

    if (mp) {

      this.formInsumo.patchValue({

        nombreMateriaPrima: mp.nombre,
        unidadMedida: mp.unidadMedida || 'g'

      });

    }

  }

  agregarInsumoTemporal(): void {

    if (this.formInsumo.invalid) {

      this.formInsumo.markAllAsTouched();
      return;

    }

    this.insumos.push({
      ...this.formInsumo.value
    });

    this.formInsumo.reset({

      cantidad: 1,
      unidadMedida: 'g'

    });

  }

  quitarInsumoTemporal(index: number): void {

    this.insumos.splice(index, 1);

  }

  finalizarRegistro(): void {
    if (this.formReceta.invalid) {

      this.formReceta.markAllAsTouched();
      return;

    }

    if (this.insumos.length === 0) {

      Swal.fire(
        'Atención',
        'Debes agregar al menos un ingrediente.',
        'warning'
      );

      return;

    }

    this.guardando = true;

    const payload: CrearProductoCompletoRequest = {

      nombre: this.formProducto.value.nombre,
    
      descripcion:
        this.formProducto.value.descripcion || '',
    
      tiempoEstimadoMinutos:
        Number(this.formReceta.value.tiempoEstimadoMinutos),
    
      insumos: this.insumos
    
    };
    
    
    const peticion = this.modoEdicion
    
      ? this.productosService.actualizarProductoCompleto(
          this.productoId!,
          payload
        )
  
      : this.productosService.crearProductoCompleto(payload);
    
    peticion.subscribe({  
      next: () => {
  
        Swal.fire({  
          icon: 'success',
          title: this.modoEdicion
            ? 'Producto actualizado'
            : 'Producto registrado',
  
          text: this.modoEdicion
            ? 'El producto y su receta fueron actualizados correctamente.'
            : 'El producto y su receta fueron registrados correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate([
            '/admin/admin-productos'
          ]);
        });
      },
    
      error: (err) => {
        this.guardando = false;
        console.error(
          'Error guardando producto completo:',
          err
        );
    
        Swal.fire({
          icon:'error',
          title:'Error',
          text:
            err.error?.mensaje ||
            err.error?.Mensaje ||
            'No fue posible guardar el producto.'
        });}
    });
  }
}