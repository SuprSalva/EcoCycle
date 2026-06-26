import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Auth, updatePassword } from '@angular/fire/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.scss']
})
export class PerfilClienteComponent implements OnInit {
  perfilForm: FormGroup;
  passwordForm: FormGroup;
  cargando = true;

  constructor(private fb: FormBuilder, private authService: AuthService, private fireAuth: Auth) {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: [''],
      direccion: ['']
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (usuario: any) => {
        this.perfilForm.patchValue(usuario);
        this.cargando = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
        this.cargando = false;
      }
    });
  }

  actualizarPerfil() {
    if (this.perfilForm.invalid) return;

    this.authService.actualizarUsuario(this.fireAuth.currentUser?.uid || '', this.perfilForm.value).subscribe({
      next: () => Swal.fire('Éxito', 'Perfil actualizado', 'success'),
      error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
    });
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) return;
    const pwd = this.passwordForm.value.password;
    if (pwd !== this.passwordForm.value.confirmar) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    const user = this.fireAuth.currentUser;
    if (user) {
      updatePassword(user, pwd).then(() => {
        Swal.fire('Éxito', 'Contraseña actualizada', 'success');
        this.passwordForm.reset();
      }).catch(err => {
        Swal.fire('Error', 'No se pudo actualizar. Es posible que debas iniciar sesión nuevamente.', 'error');
      });
    }
  }
}
