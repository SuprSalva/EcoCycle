import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

// Interface para tipado
export interface UsuarioData {
  id?: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  telefono: string;
  direccion: string;
  saldoPuntos?: number;
  activo?: boolean;
}

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss']
})
export class UsuarioFormComponent implements OnInit, OnChanges {
  @Input() idSeleccionado: string | null = null;
  @Output() finalizar = new EventEmitter<void>();

  usuarioForm!: FormGroup;
  esEdicion: boolean = false;
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idSeleccionado']) {
      const id = this.idSeleccionado;
      if (id) {
        this.esEdicion = true;
        this.cargarUsuario(id);
      } else {
        this.esEdicion = false;
        if (this.usuarioForm) {
          this.usuarioForm.reset({ rol: 'usuario' });
          this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
          this.usuarioForm.get('password')?.updateValueAndValidity();
        }
      }
    }
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['usuario', [Validators.required]],
      telefono: [''],
      direccion: [''],
      saldoPuntos: [0],
      password: [''],
      confirmarPassword: ['']
    });

    if (!this.idSeleccionado) {
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  cargarUsuario(id: string): void {
    this.cargando = true;
    this.notificationService.showLoading('Cargando...', 'Obteniendo datos del usuario');
    
    this.authService.obtenerUsuarioPorId(id).subscribe({
      next: (usuario: UsuarioData | null) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        
        if (usuario) {
          this.usuarioForm.patchValue({
            nombre: usuario.nombre || '',
            apellidos: usuario.apellidos || '',
            email: usuario.email || '',
            telefono: usuario.telefono || '',
            direccion: usuario.direccion || '',
            saldoPuntos: usuario.saldoPuntos || 0,
            rol: usuario.rol || 'usuario',
            password: '', 
            confirmarPassword: ''
          });
          
          // Deshabilitar campos que no deben editarse
          this.usuarioForm.get('email')?.disable();
          this.usuarioForm.get('password')?.disable();
          this.usuarioForm.get('confirmarPassword')?.disable();
          this.usuarioForm.get('saldoPuntos')?.disable();
          
          // Remover validaciones de password
          this.usuarioForm.get('password')?.clearValidators();
          this.usuarioForm.get('password')?.updateValueAndValidity();
        } else {
          this.notificationService.error('Error', 'Usuario no encontrado.');
          this.volver();
        }
      },
      error: (err: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        console.error('Error al cargar usuario:', err);
        this.notificationService.error('Error', 'No se pudo cargar la información del usuario.');
        this.volver();
      }
    });
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.notificationService.warning('Campos Incompletos', 'Por favor llena todos los datos obligatorios correctamente.');
      return;
    }

    const valores = this.usuarioForm.getRawValue();

    if (!this.esEdicion || (this.esEdicion && valores.password)) {
      if (valores.password !== valores.confirmarPassword) {
        this.notificationService.error('Error de Seguridad', 'Las contraseñas ingresadas no coinciden.');
        return;
      }
      
      if (valores.password && valores.password.length < 6) {
        this.notificationService.error('Error de Seguridad', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    if (this.esEdicion) {
      this.actualizarUsuario(valores);
    } else {
      this.crearUsuario(valores);
    }
  }

  private actualizarUsuario(valores: any): void {
    const payloadActualizar = {
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      telefono: valores.telefono || '',
      direccion: valores.direccion || '',
      rol: valores.rol
    };

    this.cargando = true;
    this.notificationService.showLoading('Actualizando...', 'Guardando los cambios del usuario');

    this.authService.actualizarUsuario(this.idSeleccionado!, payloadActualizar).subscribe({
      next: () => {
        this.cargando = false;
        this.notificationService.hideLoading();
        this.notificationService.success('¡Actualizado!', 'El usuario ha sido modificado con éxito.');
        this.volver();
      },
      error: (err: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        console.error('Error al actualizar:', err);
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        this.notificationService.error('Error al Actualizar', errorMsg);
      }
    });
  }

  private crearUsuario(valores: any): void {
    if (!valores.password) {
      this.notificationService.warning('Contraseña Requerida', 'Debes establecer una contraseña para el nuevo usuario.');
      return;
    }

    const payloadNuevo = {
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      email: valores.email,
      telefono: valores.telefono || '',
      direccion: valores.direccion || '',
      password: valores.password,
      rol: valores.rol
    };

    this.cargando = true;
    this.notificationService.showLoading('Guardando...', 'Registrando al nuevo usuario');

    this.authService.registrarDesdeAdmin(payloadNuevo).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        this.notificationService.success('¡Creado!', 'El usuario ha sido insertado con éxito en el sistema.');
        this.volver();
      },
      error: (err: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        console.error('Error al crear usuario:', err);
        const errorMsg = err.error?.message || err.message || 'Error desconocido';
        this.notificationService.error('Error en el Registro', errorMsg);
      }
    });
  }

  volver(): void {
    this.finalizar.emit();
  }

  hasError(campo: string, error: string): boolean {
    const control = this.usuarioForm.get(campo);
    return control ? control.hasError(error) && control.touched : false;
  }

  getErrorMessage(campo: string): string {
    const control = this.usuarioForm.get(campo);
    if (!control) return '';
    
    if (control.hasError('required')) {
      const nombreCampo = campo.charAt(0).toUpperCase() + campo.slice(1);
      return `${nombreCampo} es obligatorio`;
    }
    if (control.hasError('email')) {
      return 'Ingresa un correo electrónico válido';
    }
    if (control.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength || 0;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }
}