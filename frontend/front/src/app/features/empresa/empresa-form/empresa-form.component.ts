import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmpresaService } from '../empresa.service';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './empresa-form.component.html'
})
export class EmpresaFormComponent {
  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    rfc:    ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]]
  });

  constructor(private fb: FormBuilder, private empresaService: EmpresaService) {}

  submit() {
    if (this.form.invalid) return;        // botón deshabilitado en template también
    this.empresaService.crear(this.form.value as any).subscribe();
  }
}
