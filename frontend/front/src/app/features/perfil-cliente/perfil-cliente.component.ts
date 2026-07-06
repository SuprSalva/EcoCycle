// 📁 src/app/features/perfil-cliente/perfil-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil-cliente.component.html',
  styleUrls: ['./perfil-cliente.component.scss']
})
export class PerfilClienteComponent implements OnInit {
  perfilForm!: FormGroup;
  passwordForm!: FormGroup;
  perfil: any = null;
  cargando: boolean = false;
  editando: boolean = false;
  mostrandoCambioPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initPasswordForm();
    this.cargarPerfil();
  }

  initForm(): void {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      telefono: [''],
      direccion: ['']
    });
  }

  initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      passwordActual: ['', [Validators.required, Validators.minLength(6)]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]]
    });
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (datos) => {
        this.perfil = datos;
        this.perfilForm.patchValue({
          nombre: datos.nombre || '',
          apellidos: datos.apellidos || '',
          telefono: datos.telefono || '',
          direccion: datos.direccion || ''
        });
        this.cargando = false;
        this.editando = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.cargando = false;
        this.notificationService.error('Error', 'No se pudo cargar la información del perfil.');
      }
    });
  }

  habilitarEdicion(): void {
    this.editando = true;
    this.mostrandoCambioPassword = false;
  }

  cancelarEdicion(): void {
    this.editando = false;
    if (this.perfil) {
      this.perfilForm.patchValue({
        nombre: this.perfil.nombre || '',
        apellidos: this.perfil.apellidos || '',
        telefono: this.perfil.telefono || '',
        direccion: this.perfil.direccion || ''
      });
    }
  }

  guardarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.notificationService.warning('Campos Incompletos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    this.cargando = true;
    const datos = this.perfilForm.value;

    this.authService.actualizarUsuario(this.perfil.id, datos).subscribe({
      next: (response) => {
        this.cargando = false;
        this.editando = false;
        this.notificationService.toastSuccess('Perfil actualizado correctamente.');
        // Actualizar datos en localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.nombre = datos.nombre;
        userData.apellidos = datos.apellidos;
        userData.telefono = datos.telefono;
        userData.direccion = datos.direccion;
        localStorage.setItem('userData', JSON.stringify(userData));
        this.cargarPerfil();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al actualizar perfil:', err);
        this.notificationService.error('Error', 'No se pudo actualizar el perfil.');
      }
    });
  }

  // ✅ MOSTRAR FORMULARIO DE CAMBIO DE CONTRASEÑA
  mostrarCambioPassword(): void {
    this.mostrandoCambioPassword = !this.mostrandoCambioPassword;
    this.editando = false;
    if (this.mostrandoCambioPassword) {
      this.passwordForm.reset();
    }
  }

  // ✅ CAMBIAR CONTRASEÑA
  cambiarContrasena(): void {
    if (this.passwordForm.invalid) {
      this.notificationService.warning('Campos Incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const passwordActual = this.passwordForm.get('passwordActual')?.value;
    const nuevaPassword = this.passwordForm.get('nuevaPassword')?.value;
    const confirmarPassword = this.passwordForm.get('confirmarPassword')?.value;

    // ✅ Validar que las contraseñas coincidan
    if (nuevaPassword !== confirmarPassword) {
      this.notificationService.error('Error', 'Las contraseñas no coinciden.');
      return;
    }

    // ✅ Validar que la nueva contraseña sea diferente a la actual
    if (passwordActual === nuevaPassword) {
      this.notificationService.warning('Contraseña igual', 'La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    this.cargando = true;
    this.notificationService.showLoading('Cambiando...', 'Actualizando tu contraseña');

    // ✅ Llamar al servicio para cambiar contraseña
    this.authService.cambiarPassword(passwordActual, nuevaPassword).subscribe({
      next: (response) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        this.notificationService.toastSuccess('Contraseña actualizada correctamente.');
        this.mostrandoCambioPassword = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        console.error('Error al cambiar contraseña:', err);
        
        let mensajeError = 'No se pudo cambiar la contraseña.';
        if (err.message) {
          mensajeError = err.message;
        }
        if (err.code === 'auth/wrong-password') {
          mensajeError = 'La contraseña actual es incorrecta.';
        }
        
        this.notificationService.error('Error', mensajeError);
      }
    });
  }

  cancelarCambioPassword(): void {
    this.mostrandoCambioPassword = false;
    this.passwordForm.reset();
  }

  hasError(campo: string, error: string): boolean {
    const control = this.perfilForm.get(campo);
    return control ? control.hasError(error) && control.touched : false;
  }

  hasPasswordError(campo: string, error: string): boolean {
    const control = this.passwordForm.get(campo);
    return control ? control.hasError(error) && control.touched : false;
  }

  getErrorMessage(campo: string): string {
    const control = this.perfilForm.get(campo);
    if (!control) return '';
    
    if (control.hasError('required')) {
      const nombreCampo = campo.charAt(0).toUpperCase() + campo.slice(1);
      return `${nombreCampo} es obligatorio`;
    }
    if (control.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }

  getPasswordErrorMessage(campo: string): string {
    const control = this.passwordForm.get(campo);
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }
}