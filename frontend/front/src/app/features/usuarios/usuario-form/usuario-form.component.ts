import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

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
      nombre: ['', [Validators.required]],
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
    this.authService.obtenerUsuarioPorId(id).subscribe({
      next: (usuario) => {
        this.cargando = false;
        if (usuario) {
          this.usuarioForm.patchValue({
            nombre: usuario.nombre,
            apellidos: usuario.apellidos || '',
            email: usuario.email,
            telefono: usuario.telefono || '',
            direccion: usuario.direccion || '',
            saldoPuntos: usuario.saldoPuntos || 0,
            rol: usuario.rol || 'usuario',
            password: '', 
            confirmarPassword: ''
          });
          this.usuarioForm.get('password')?.clearValidators();
          this.usuarioForm.get('password')?.updateValueAndValidity();
          // Desactivar solo los campos que no se pueden editar
          this.usuarioForm.get('email')?.disable();
          this.usuarioForm.get('password')?.disable();
          this.usuarioForm.get('confirmarPassword')?.disable();
        } else {
          this.notificationService.error('Error', 'Usuario no encontrado.');
          this.volver();
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
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

    const valores = this.usuarioForm.value;

    if (!this.esEdicion || valores.password) {
      if (valores.password !== valores.confirmarPassword) {
        this.notificationService.error('Error de Seguridad', 'Las contraseñas ingresadas no coinciden.');
        return;
      }
    }

    if (this.esEdicion) {
      const payloadActualizar = {
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        telefono: valores.telefono,
        direccion: valores.direccion,
        rol: valores.rol
      };

      this.notificationService.showLoading('Actualizando...', 'Guardando los cambios del usuario');
      this.authService.actualizarUsuario(this.idSeleccionado!, payloadActualizar).subscribe({
        next: () => {
          this.notificationService.hideLoading();
          this.notificationService.success('¡Actualizado!', 'El usuario ha sido modificado con éxito.');
          this.volver();
        },
        error: (err: any) => {
          this.notificationService.hideLoading();
          console.error(err);
          const errorMsg = err.error?.message || err.message || 'Error desconocido';
          this.notificationService.error('Error al Actualizar', errorMsg);
        }
      });
    } else {
      const payloadNuevo = {
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        email: valores.email,
        telefono: valores.telefono,
        direccion: valores.direccion,
        password: valores.password,
        rol: valores.rol
      };

      this.notificationService.showLoading('Guardando...', 'Registrando al nuevo usuario');
      this.authService.registrarDesdeAdmin(payloadNuevo).subscribe({
        next: () => {
          this.notificationService.hideLoading();
          this.notificationService.success('¡Creado!', 'El usuario ha sido insertado con éxito en el sistema.');
          this.volver();
        },
        error: (err: any) => {
          this.notificationService.hideLoading();
          console.error(err);
          const errorMsg = err.error?.message || err.message || 'Error desconocido';
          this.notificationService.error('Error en el Registro', errorMsg);
        }
      });
    }
  }

  volver(): void {
    this.finalizar.emit();
  }
}
