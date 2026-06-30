import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
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
        
        // Redirigir según el rol
        if (rol === 'admin' || rol === 'administrador') {
          this.notificationService.toastSuccess('¡Bienvenido Administrador!');
          this.router.navigate(['/panel']); // Panel de administración
        } else {
          this.notificationService.toastSuccess('¡Inicio de sesión exitoso!');
          this.router.navigate(['/dashboard']); // O la ruta que quieras para usuarios normales
        }
      },
      error: (err) => {
        this.notificationService.hideLoading();
        console.error(err);
        this.notificationService.error('Error de Autenticación', 'Credenciales incorrectas o el usuario no existe.');
        this.authService.logout().subscribe();
      }
    });
  }
}