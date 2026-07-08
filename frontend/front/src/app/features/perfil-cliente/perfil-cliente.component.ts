// 📁 src/app/features/perfil-cliente/perfil-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
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
  mostrandoSelectorAvatar: boolean = false;
  procesandoImagen: boolean = false;
  mensajeCarga: string = 'Cargando tu información...';

  archivoSeleccionado: File | null = null;
  imagenPreviewUrl: string | null = null;

  predefinedAvatars: string[] = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Jocelyn',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Nala',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Destiny'
  ];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private storage: Storage
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
    this.mensajeCarga = 'Cargando tu información...';
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (datos) => {
        this.perfil = datos;
        this.imagenPreviewUrl = datos.avatarUrl || null;
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
    this.archivoSeleccionado = null;
    this.imagenPreviewUrl = this.perfil?.avatarUrl || null;
    if (this.perfil) {
      this.perfilForm.patchValue({
        nombre: this.perfil.nombre || '',
        apellidos: this.perfil.apellidos || '',
        telefono: this.perfil.telefono || '',
        direccion: this.perfil.direccion || ''
      });
    }
  }

  async guardarPerfil() {
    if (this.perfilForm.invalid) {
      this.notificationService.warning('Campos Incompletos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    this.cargando = true;
    this.mensajeCarga = 'Guardando perfil y foto...';
    this.notificationService.showLoading('Guardando...', 'Actualizando tu perfil');

    try {
      let finalAvatarUrl = this.perfil?.avatarUrl;

      // Si seleccionaron un nuevo archivo local, lo subimos a fotosperfil/
      if (this.archivoSeleccionado) {
        const filePath = `fotosperfil/${this.perfil.id}_${Date.now()}`;
        const storageRef = ref(this.storage, filePath);
        const uploadTask = await uploadBytes(storageRef, this.archivoSeleccionado);
        finalAvatarUrl = await getDownloadURL(uploadTask.ref);
      } else if (this.imagenPreviewUrl && this.imagenPreviewUrl !== this.perfil?.avatarUrl) {
        // Seleccionaron un icono predeterminado
        finalAvatarUrl = this.imagenPreviewUrl;
      }

      const datos = {
        ...this.perfilForm.value,
        avatarUrl: finalAvatarUrl
      };

      this.authService.actualizarUsuario(this.perfil.id, datos).subscribe({
        next: (response) => {
          this.cargando = false;
          this.editando = false;
          this.archivoSeleccionado = null;
          this.notificationService.hideLoading();
          this.notificationService.toastSuccess('Perfil actualizado correctamente.');
          
          // Actualizar datos en localStorage
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.nombre = datos.nombre;
          userData.apellidos = datos.apellidos;
          userData.telefono = datos.telefono;
          userData.direccion = datos.direccion;
          userData.avatarUrl = finalAvatarUrl;
          localStorage.setItem('userData', JSON.stringify(userData));
          
          this.cargarPerfil();
        },
        error: (err) => {
          this.cargando = false;
          this.notificationService.hideLoading();
          console.error('Error al actualizar perfil:', err);
          this.notificationService.error('Error', 'No se pudo actualizar el perfil.');
        }
      });
    } catch (err) {
      this.cargando = false;
      this.notificationService.hideLoading();
      console.error('Error al subir imagen', err);
      this.notificationService.error('Error', 'Ocurrió un error al subir la imagen de perfil.');
    }
  }

  // ✅ MANEJO DE AVATARES
  abrirSelectorAvatar(): void {
    if (this.editando) {
      this.mostrandoSelectorAvatar = true;
    }
  }

  cerrarSelectorAvatar(): void {
    this.mostrandoSelectorAvatar = false;
  }

  alSeleccionarArchivo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.procesandoImagen = true;
      this.archivoSeleccionado = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Simulamos un pequeño tiempo de carga visual
        setTimeout(() => {
          this.imagenPreviewUrl = e.target.result;
          this.procesandoImagen = false;
          this.cerrarSelectorAvatar();
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  }

  seleccionarIconoPredeterminado(url: string): void {
    this.procesandoImagen = true;
    // Simulamos un tiempo de carga visual para el icono
    setTimeout(() => {
      this.archivoSeleccionado = null;
      this.imagenPreviewUrl = url;
      this.procesandoImagen = false;
      this.cerrarSelectorAvatar();
    }, 600);
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