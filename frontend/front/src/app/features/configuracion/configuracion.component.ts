import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  passwordForm!: FormGroup;
  notifForm!: FormGroup;
  perfil: any = null;
  cargando = false;
  mostrandoPassword = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initPasswordForm();
    this.initNotifForm();
    this.cargarPerfil();
  }

  initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      passwordActual: ['', [Validators.required, Validators.minLength(6)]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]]
    });
  }

  initNotifForm(): void {
    this.notifForm = this.fb.group({
      emailReciclaje: [true],
      emailPromociones: [false],
      sonido: [true]
    });
    const saved = localStorage.getItem('notif_prefs');
    if (saved) {
      this.notifForm.patchValue(JSON.parse(saved));
    }
  }

  cargarPerfil(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.perfil = JSON.parse(userData);
    }
  }

  mostrarPassword(): void {
    this.mostrandoPassword = !this.mostrandoPassword;
    if (this.mostrandoPassword) {
      this.passwordForm.reset();
    }
  }

  cambiarContrasena(): void {
    if (this.passwordForm.invalid) {
      this.notificationService.warning('Campos Incompletos', 'Completa todos los campos.');
      return;
    }

    const { passwordActual, nuevaPassword, confirmarPassword } = this.passwordForm.value;

    if (nuevaPassword !== confirmarPassword) {
      this.notificationService.error('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (passwordActual === nuevaPassword) {
      this.notificationService.warning('Igual', 'La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    this.cargando = true;
    this.notificationService.showLoading('Cambiando...', 'Actualizando contraseña');

    this.authService.cambiarPassword(passwordActual, nuevaPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.notificationService.hideLoading();
        this.notificationService.toastSuccess('Contraseña actualizada.');
        this.mostrandoPassword = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        const msg = err?.code === 'auth/wrong-password'
          ? 'La contraseña actual es incorrecta.'
          : err?.message || 'No se pudo cambiar la contraseña.';
        this.notificationService.error('Error', msg);
      }
    });
  }

  cancelarPassword(): void {
    this.mostrandoPassword = false;
    this.passwordForm.reset();
  }

  guardarNotificaciones(): void {
    localStorage.setItem('notif_prefs', JSON.stringify(this.notifForm.value));
    this.notificationService.toastSuccess('Preferencias guardadas.');
  }

  hasError(campo: string, error: string): boolean {
    const control = this.passwordForm.get(campo);
    return control ? control.hasError(error) && control.touched : false;
  }
}
