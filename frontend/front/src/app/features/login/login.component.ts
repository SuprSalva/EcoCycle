import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      alert('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        alert('¡Inicio de sesión exitoso en Firebase!');
        
        
        this.router.navigate(['/panel']); 
      },
      error: (err) => {
        console.error(err);
        alert('Error al iniciar sesión: ' + err.message);
      }
    });
  }
}