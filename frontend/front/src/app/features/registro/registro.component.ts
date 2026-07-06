import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  email = '';
  password = '';
  nombre = '';
  apellidos = '';
  telefono = '';
  direccion = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onRegistro() {
    if (!this.email || !this.password || !this.nombre) {
      this.notificationService.warning('Campos Incompletos', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (this.password.length < 6) {
      this.notificationService.warning('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isLoading = true;
    this.notificationService.showLoading('Registrando...', 'Creando tu cuenta');

    const datosAdicionales = {
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      direccion: this.direccion
    };

    // ✅ CORREGIDO: Tipado explícito
    this.authService.registro(this.email, this.password, datosAdicionales).subscribe({
      next: (respuestaBackend: any) => {
        this.isLoading = false;
        this.notificationService.hideLoading();
        this.notificationService.toastSuccess('¡Registro exitoso!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notificationService.hideLoading();
        console.error('Error en registro:', err);
        
        let mensajeError = 'Error al registrar usuario.';
        if (err.error?.message) {
          mensajeError = err.error.message;
        } else if (err.message) {
          mensajeError = err.message;
        }
        
        this.notificationService.error('Error de Registro', mensajeError);
      }
    });
  }
}