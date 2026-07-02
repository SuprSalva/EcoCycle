import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CompraService } from '../../../core/services/compra.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { MateriaPrimaService, MateriaPrima } from '../../../core/services/materia-prima.service';
import { Proveedor } from '../../../models/proveedor.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './compras-form.component.html',
  styleUrls: ['./compras-form.component.scss']
})
export class ComprasFormComponent implements OnInit {
  form: FormGroup;
  proveedores: Proveedor[] = [];
  materiasPrimas: MateriaPrima[] = [];
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private compraService: CompraService,
    private proveedorService: ProveedorService,
    private materiaPrimaService: MateriaPrimaService,
    private router: Router
  ) {
    this.form = this.fb.group({
      proveedorId: ['', Validators.required],
      detalles: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
    this.cargarMateriasPrimas();
    this.agregarDetalle(); // Add one row by default
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  agregarDetalle(): void {
    const detalleForm = this.fb.group({
      nombreMateriaPrima: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]]
    });
    this.detalles.push(detalleForm);
  }

  removerDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe((res: any) => {
      this.proveedores = res.data;
    });
  }

  cargarMateriasPrimas(): void {
    this.materiaPrimaService.obtenerTodas().subscribe((res: any) => {
      this.materiasPrimas = res;
    });
  }

  calcularTotal(): number {
    let total = 0;
    for (let i = 0; i < this.detalles.length; i++) {
      const d = this.detalles.at(i).value;
      total += (d.cantidad || 0) * (d.precioUnitario || 0);
    }
    return total;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const proveedor = this.proveedores.find(p => p.id === val.proveedorId);
    
    if (!proveedor) return;

    this.guardando = true;

    const dto = {
      proveedorId: proveedor.id,
      proveedorNombre: proveedor.nombre,
      detalles: val.detalles.map((d: any) => {
        return {
          nombreMateriaPrima: d.nombreMateriaPrima,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario
        };
      })
    };

    this.compraService.registrarCompra(dto).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Compra registrada y stock actualizado correctamente', 'success');
        this.router.navigate(['/panel/compras-proveedores']);
      },
      error: (err) => {
        this.guardando = false;
        Swal.fire('Error', err.error?.message || 'No se pudo registrar la compra', 'error');
      }
    });
  }
}
