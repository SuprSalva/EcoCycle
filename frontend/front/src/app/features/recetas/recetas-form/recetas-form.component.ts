import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RecetasService } from '../../../core/services/recetas.service';
import { Receta } from '../../../models/receta.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recetas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recetas-form.component.html',
  styleUrls: ['./recetas-form.component.scss']
})
export class RecetasFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  recetaId: string | null = null;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private recetasService: RecetasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      productoId: ['', Validators.required],
      nombreProducto: ['', Validators.required],
      descripcion: [''],
      version: [1, [Validators.required, Validators.min(1)]],
      tiempoEstimadoMinutos: [0, [Validators.required, Validators.min(0)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.recetaId = this.route.snapshot.paramMap.get('id');
    if (this.recetaId) {
      this.isEdit = true;
      this.cargarReceta();
    }
  }

  cargarReceta(): void {
    this.recetasService.obtenerPorId(this.recetaId!).subscribe({
      next: (res: Receta) => {
        this.form.patchValue({
          productoId: res.productoId,
          nombreProducto: res.nombreProducto,
          descripcion: res.descripcion,
          version: res.version,
          tiempoEstimadoMinutos: res.tiempoEstimadoMinutos,
          activo: res.activo
        });
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la información de la receta', 'error');
        this.router.navigate(['/recetas']);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const data: Receta = this.form.value;

    const peticion = this.isEdit
      ? this.recetasService.actualizar(this.recetaId!, data)
      : this.recetasService.crear(data);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', `Receta ${this.isEdit ? 'actualizada' : 'registrada'} correctamente`, 'success');
        this.router.navigate(['/recetas']);
      },
      error: () => {
        this.guardando = false;
        Swal.fire('Error', 'Ocurrió un error al guardar la receta', 'error');
      }
    });
  }
}