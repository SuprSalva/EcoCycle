// login.component.ts - VERSIÓN CORREGIDA
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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

        console.log('📦 Respuesta completa:', response);
        console.log('📦 suceso:', response.suceso); // ✅ Cambiado de success a suceso
        console.log('📦 Data:', response.data);
        console.log('📦 Rol:', response.data?.rol);

        // ✅ CORREGIDO: Usar 'suceso' en lugar de 'success'
        if (response.suceso && response.data) {
          const usuario = response.data;
          const rol = (usuario.rol || '').toLowerCase();

          // ✅ GUARDAR EL ROL EN LOCALSTORAGE
          localStorage.setItem('userRol', rol);

          // ✅ CERRAR TODAS LAS NOTIFICACIONES
          this.notificationService.hideLoading();

          // ✅ MOSTRAR MENSAJE DE ÉXITO
          this.notificationService.showLoading('Redirigiendo...', `Bienvenido ${usuario.nombre || 'Usuario'}`);

          // ✅ REDIRECCIÓN CON RETARDO
          setTimeout(() => {
            this.notificationService.hideLoading();
            
            if (rol === 'admin' || rol === 'administrador') {
              console.log('👑 Redirigiendo a ADMIN');
              this.router.navigate(['/admin/dashboard']);
            } else {
              console.log('👤 Redirigiendo a CLIENTE');
              this.router.navigate(['/cliente/dashboard']);
            }
          }, 1000);
          
        } else {
          this.notificationService.hideLoading();
          this.notificationService.error('Error', response.message || 'Error al iniciar sesión.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.hideLoading();
        console.error('❌ Error en login:', err);
        
        let mensajeError = 'Credenciales incorrectas o usuario no existe.';
        if (err.error?.message) {
          mensajeError = err.error.message;
        }
        
        this.notificationService.error('Error de Autenticación', mensajeError);
        this.authService.logout().subscribe();
      }
    });
  }
}