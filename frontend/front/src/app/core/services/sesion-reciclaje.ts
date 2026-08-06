import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
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
  
  private readonly API_URL = `${environment.apiUrl}/SesionReciclaje`;

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
      maquinaId: ['MQ-ECO-01', [Validators.required]],
      botellas: ['', [Validators.required, Validators.min(1)]]
    });
  }

  registrarSesion(): void {
    if (this.reciclajeForm.invalid) {
      Swal.fire('Formulario Inválido', 'Verifica que el ID de usuario y la cantidad de botellas sean correctos.', 'warning');
      return;
    }

    this.procesando = true;

    // 🌟 CORREGIDO: Estructuramos el payload exacto que consume el controlador de C#
    // Enviamos mapeadas las propiedades para que coincidan con tu backend y Firestore
    const payload = {
      UsuarioId: this.reciclajeForm.value.usuarioId,
      MaquinaId: this.reciclajeForm.value.maquinaId,
      Botellas: Number(this.reciclajeForm.value.botellas),
      Puntos: this.puntosCalculados // Mandamos el cálculo para que el repositorio de C# pueda leer .Sum(d => d.puntos)
    };

    this.http.post<any>(this.API_URL, payload).subscribe({
      next: (respuesta) => {
        this.procesando = false;
        
        Swal.fire({
          title: '¡Depósito Exitoso!',
          text: `Se han procesado ${payload.Botellas} botellas e ingresado ${this.puntosCalculados} EcoPts al sistema.`,
          icon: 'success',
          confirmButtonColor: '#7cb342'
        });

        // Limpiar el formulario y restablecer estados
        this.reciclajeForm.reset({ maquinaId: 'MQ-ECO-01' });
        this.puntosCalculados = 0;
      },
      error: (err) => {
        this.procesando = false;
        console.error('Error al registrar sesión:', err);
        
        const mensajeError = err.error?.message || 'No se pudo comunicar con el módulo IoT. Verifica que el Backend esté corriendo en el puerto 5171.';
        Swal.fire('Error de Conexión', mensajeError, 'error');
      }
    });
  }
}