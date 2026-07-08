import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './proveedores-form.component.html',
  styleUrls: ['./proveedores-form.component.scss']
})
export class ProveedoresFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  proveedorId: string | null = null;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      empresa: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.proveedorId = this.route.snapshot.paramMap.get('id');
    if (this.proveedorId) {
      this.isEdit = true;
      this.cargarProveedor();
    }
  }

  cargarProveedor(): void {
    this.proveedorService.getProveedor(this.proveedorId!).subscribe({
      next: (res: any) => {
        this.form.patchValue(res.data);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar la información del proveedor', 'error');
        this.router.navigate(['/admin/proveedores']);
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const data = this.form.value;

    const peticion = this.isEdit 
      ? this.proveedorService.actualizarProveedor(this.proveedorId!, data)
      : this.proveedorService.crearProveedor(data);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', `Proveedor ${this.isEdit ? 'actualizado' : 'registrado'} correctamente`, 'success');
        this.router.navigate(['/admin/proveedores']);
      },
      error: () => {
        this.guardando = false;
        Swal.fire('Error', 'Ocurrió un error al guardar', 'error');
      }
    });
  }
}
