import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  nombre = '';
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegistro() {
    if (!this.email || !this.password || !this.nombre) {
      alert('Por favor, llena los campos obligatorios.');
      return;
    }

    // Pasamos el email, password y el objeto con datos extras para C#
    const datosExtras = {
      nombre: this.nombre,
      apellidos: '', // Puedes mapear más campos en tu HTML si lo deseas
      telefono: '',
      direccion: ''
    };

    this.authService.registro(this.email, this.password, datosExtras).subscribe({
      next: (respuestaBackend) => {
        // Este mensaje viene de tu return Ok(ApiResponse.Ok(...)) en C#
        alert('¡Usuario registrado con éxito en Firebase y en la Base de Datos Local!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Hubo un error en el registro completo: ' + (err.error?.message || err.message));
      }
    });
  }
}