import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { switchMap } from 'rxjs';

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

    this.notificationService.showLoading('Iniciando sesión...', 'Autenticando credenciales');

    this.authService.login(this.email, this.password).pipe(
      switchMap(() => this.authService.obtenerPerfilUsuario())
    ).subscribe({
      next: (perfil) => {
        this.notificationService.hideLoading();
        const rol = (perfil?.rol || '').toLowerCase();
        if (rol === 'admin' || rol === 'administrador') {
          this.notificationService.toastSuccess('¡Inicio de sesión exitoso!');
          this.router.navigate(['/panel']); 
        } else {
          this.notificationService.error('Acceso Denegado', 'Solo los administradores pueden ingresar al panel web.');
          this.authService.logout().subscribe(); // Cerramos la sesión que Firebase acababa de abrir
        }
      },
      error: (err) => {
        this.notificationService.hideLoading();
        console.error(err);
        this.notificationService.error('Error de Autenticación', 'Credenciales incorrectas o el usuario no existe.');
        this.authService.logout().subscribe(); // Cerramos sesión por seguridad si falla el perfil
      }
    });
  }
}