import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { switchMap } from 'rxjs';

import { BarComponent } from '../../shared/components/bar/bar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, BarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.notificationService.warning('Campos Incompletos', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }

    this.isLoading = true;
    this.notificationService.showLoading('Iniciando sesión...', 'Autenticando credenciales');

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.hideLoading();

        console.log('Respuesta completa:', response);
        console.log('suceso:', response.suceso); // 
        console.log('Data:', response.data);
        console.log('Rol:', response.data?.rol);

        if (response.suceso && response.data) {
          const usuario = response.data;
          const rol = (usuario.rol || '').toLowerCase();
          localStorage.setItem('userRol', rol);
          this.notificationService.hideLoading();
          this.notificationService.showLoading('Redirigiendo...', `Bienvenido ${usuario.nombre || 'Usuario'}`);
          setTimeout(() => {
            this.notificationService.hideLoading();
            
            if (rol === 'admin' || rol === 'administrador') {
              console.log('Redirigiendo a ADMIN');
              this.router.navigate(['/admin/dashboard']);
            } else {
              console.log('Redirigiendo a CLIENTE');
              this.router.navigate(['/cliente/dashboard']);
            }
          }, 1000);
          
        } else {
          this.notificationService.hideLoading();
          this.notificationService.error('Error', response.message || 'Error al iniciar sesión.');
          this.notificationService.toastSuccess('¡Inicio de sesión exitoso!');
          this.router.navigate(['/panel/cliente']); // O la ruta que quieras para usuarios normales
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.hideLoading();
        console.error('Error en login:', err);
        
        let mensajeError = 'Credenciales incorrectas o usuario no existe.';
        if (err.error?.message) {
          mensajeError = err.error.message;
        }
        
        this.notificationService.error('Error de Autenticación', mensajeError);
        this.authService.logout().subscribe();
      }
    });
  }

  onForgotPassword(event: Event) {
    event.preventDefault(); // Evita que se envíe el formulario si está dentro de uno
    if (!this.email) {
      this.notificationService.warning('Correo requerido', 'Por favor, escribe tu correo arriba para recuperar la contraseña.');
      return;
    }

    this.notificationService.showLoading('Enviando...', 'Enviando enlace de recuperación');
    
    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.notificationService.hideLoading();
        this.notificationService.toastSuccess('Correo enviado. Revisa tu bandeja de entrada o spam.');
      },
      error: (err) => {
        this.notificationService.hideLoading();
        console.error(err);
        this.notificationService.error('Error', 'No se pudo enviar el correo. Verifica tu dirección.');
      }
    });
  }
}