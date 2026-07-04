import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UsuarioService } from '../../../core/services/Usuario.service';

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
    private fb: FormBuilder,
    private usuarioService: UsuarioService
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
          // ✅ SOLO ELIMINAR VALIDACIONES DE PASSWORD PARA NUEVOS USUARIOS
          this.usuarioForm.get('password')?.clearValidators();
          this.usuarioForm.get('password')?.updateValueAndValidity();
          this.usuarioForm.get('confirmarPassword')?.clearValidators();
          this.usuarioForm.get('confirmarPassword')?.updateValueAndValidity();
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

    // ✅ NO AGREGAR VALIDACIONES DE PASSWORD PARA NUEVOS USUARIOS
    // La contraseña la genera el backend automáticamente
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

    // ✅ SOLO VALIDAR CONTRASEÑA EN EDICIÓN
    if (this.esEdicion && valores.password) {
      if (valores.password !== valores.confirmarPassword) {
        this.notificationService.error('Error de Seguridad', 'Las contraseñas ingresadas no coinciden.');
        return;
      }
      
      if (valores.password.length < 6) {
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

  // ✅ CREAR USUARIO - SIN CONTRASEÑA (EL BACKEND LA GENERA)
  private crearUsuario(valores: any): void {
    // ✅ NO enviamos la contraseña, el backend la genera automáticamente
    const payloadNuevo = {
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      email: valores.email,
      telefono: valores.telefono || '',
      direccion: valores.direccion || '',
      rol: valores.rol
    };

    this.cargando = true;
    this.notificationService.showLoading('Guardando...', 'Registrando al nuevo usuario');

    this.usuarioService.crearCliente(payloadNuevo).subscribe({
      next: (respuesta: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        
        if (respuesta.suceso) {
          const mensajeCorreo = respuesta.data?.CorreoEnviado 
            ? '✅ Las credenciales han sido enviadas al correo del usuario.' 
            : '⚠️ No se pudo enviar el correo. Revisa la configuración.';
          
          this.notificationService.success('¡Creado!', `Usuario creado exitosamente. ${mensajeCorreo}`);
          this.volver();
        } else {
          this.notificationService.error('Error', respuesta.message || 'No se pudo crear el usuario.');
        }
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