import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sesion-reciclaje',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sesion-reciclaje.component.html',
  styleUrls: ['./sesion-reciclaje.component.scss']
})
export class SesionReciclajeComponent implements OnInit {
  reciclajeForm!: FormGroup;
  puntosCalculados: number = 0;
  procesando: boolean = false;
  
  // URL base de tu API Gateway o backend local en C#
  private readonly API_URL = 'http://localhost:5000/api/SesionReciclaje';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.initForm();
    
    // Escuchar cambios en la cantidad de botellas para proyectar los puntos en tiempo real
    this.reciclajeForm.get('botellas')?.valueChanges.subscribe((valor) => {
      if (valor && valor > 0) {
        this.puntosCalculados = Number((valor * 0.10).toFixed(2));
      } else {
        this.puntosCalculados = 0;
      }
    });
  }

  initForm(): void {
    this.reciclajeForm = this.fb.group({
      usuarioId: ['', [Validators.required]],
      maquinaId: ['MQ-ECO-01', [Validators.required]], // Valor por defecto operativo
      botellas: ['', [Validators.required, Validators.min(1)]]
    });
  }

  registrarSesion(): void {
    if (this.reciclajeForm.invalid) {
      Swal.fire('Formulario Inválido', 'Verifica que el ID de usuario y la cantidad de botellas sean correctos.', 'warning');
      return;
    }

    this.procesando = true;
    const payload = this.reciclajeForm.value;

    this.http.post<any>(this.API_URL, payload).subscribe({
      next: (respuesta) => {
        this.procesando = false;
        
        Swal.fire({
          title: '¡Sesión Registrada!',
          text: `Se han abonado ${this.puntosCalculados} puntos exitosamente al usuario.`,
          icon: 'success',
          confirmButtonColor: '#7cb342'
        });

        // Limpiar el formulario y reestablecer estados iniciales
        this.reciclajeForm.reset({ maquinaId: 'MQ-ECO-01' });
        this.puntosCalculados = 0;
      },
      error: (err) => {
        this.procesando = false;
        console.error('Error al registrar sesión:', err);
        
        const mensajeError = err.error?.message || 'No se pudo comunicar con el módulo IoT o la base de datos.';
        Swal.fire('Error Operativo', mensajeError, 'error');
      }
    });
  }
}