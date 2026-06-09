import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioForm!: FormGroup;
  esEdicion: boolean = false;
  usuarioSeleccionadoId: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obtenerLista();
  }

  // Inicializa el formulario reactivo con validaciones básicas
  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['usuario', [Validators.required]],
      password: [''],
      confirmarPassword: ['']
    });
  }

  obtenerLista(): void {
    this.authService.obtenerTodosLosUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => console.error('Error al listar usuarios:', err)
    });
  }

  // Prepara el formulario para un Nuevo Usuario
  modalNuevoUsuario(): void {
    this.esEdicion = false;
    this.usuarioSeleccionadoId = null;
    this.usuarioForm.reset({ rol: 'usuario' });
    
    // La contraseña es requerida solo al crear
    this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  // Prepara el formulario cargando los datos del usuario a Editar
  modalEditarUsuario(usuario: any): void {
    this.esEdicion = true;
    this.usuarioSeleccionadoId = usuario.id;
    
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos || '',
      email: usuario.email,
      rol: usuario.rol || 'usuario',
      password: '', // Se dejan vacíos por seguridad si no se va a cambiar
      confirmarPassword: ''
    });

    // Al editar, la contraseña ya no es obligatoria obligatoriamente
    this.usuarioForm.get('password')?.clearValidators();
    this.usuarioForm.get('password')?.updateValueAndValidity();
  }

  // Acción del botón principal "Guardar Usuario" del Modal
  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      Swal.fire('Campos Incompletos', 'Por favor llena todos los datos obligatorios correctamente.', 'warning');
      return;
    }

    const valores = this.usuarioForm.value;

    // Validar contraseñas solo si se ha escrito algo en ellas
    if (!this.esEdicion || valores.password) {
      if (valores.password !== valores.confirmarPassword) {
        Swal.fire('Error de Seguridad', 'Las contraseñas ingresadas no coinciden.', 'error');
        return;
      }
    }

    if (this.esEdicion && this.usuarioSeleccionadoId) {
      // MODO EDICIÓN
      const bodyActualizado = {
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        rol: valores.rol
      };

      this.authService.actualizarUsuario(this.usuarioSeleccionadoId, bodyActualizado).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'Datos del usuario modificados correctamente.', 'success');
          this.obtenerLista();
          this.cerrarModalManual();
        },
        error: () => Swal.fire('Error', 'No se pudieron guardar los cambios en la base de datos.', 'error')
      });

    } else {
      // MODO REGISTRO NUEVO
      const payloadNuevo = {
        nombre: valores.nombre,
        apellidos: valores.apellidos,
        email: valores.email,
        password: valores.password,
        rol: valores.rol
      };

      this.authService.registrarDesdeAdmin(payloadNuevo).subscribe({
        next: () => {
          Swal.fire('¡Creado!', 'El usuario ha sido insertado con éxito en el sistema.', 'success');
          this.obtenerLista();
          this.cerrarModalManual();
        },
        error: () => Swal.fire('Error', 'No se pudo registrar la cuenta en Firebase Auth.', 'error')
      });
    }
  }

  // Alterna el estado del usuario entre Activo / Suspendido
  alternarEstado(usuario: any): void {
    const esSuspendido = usuario.rol === 'suspendido';
    const nuevoRol = esSuspendido ? 'usuario' : 'suspendido';
    const tituloAction = esSuspendido ? '¿Deseas reactivar esta cuenta?' : '¿Seguro que deseas suspender al usuario?';

    Swal.fire({
      title: tituloAction,
      text: esSuspendido ? 'Volverá a tener acceso normal.' : 'Se le denegará el acceso a los módulos operativos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: esSuspendido ? '#7cb342' : '#dc3545',
      confirmButtonText: esSuspendido ? 'Sí, activar' : 'Sí, suspender',
      cancelButtonText: 'Regresar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        const bodyActualizado = {
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          rol: nuevoRol
        };

        this.authService.actualizarUsuario(usuario.id, bodyActualizado).subscribe({
          next: () => {
            Swal.fire('Estatus Modificado', 'El estado de la cuenta cambió exitosamente.', 'success');
            this.obtenerLista();
          }
        });
      }
    });
  }

  // Elimina físicamente el documento de Cloud Firestore
  confirmarEliminar(usuario: any): void {
    Swal.fire({
      title: '¿Eliminar permanentemente?',
      text: `Esta acción removerá la cuenta de ${usuario.nombre} de Cloud Firestore.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef233c',
      confirmButtonText: 'Sí, borrar definitivamente',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.authService.eliminarUsuario(usuario.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La cuenta ha sido borrada.', 'success');
            this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
          }
        });
      }
    });
  }

  // Función utilitaria para cerrar el modal de Bootstrap usando la API web nativa al guardar exitosamente
  private cerrarModalManual(): void {
    const modalElement = document.getElementById('usuarioModal');
    if (modalElement) {
      const botonCerrar = modalElement.querySelector('.btn-close') as HTMLButtonElement;
      botonCerrar?.click();
    }
  }
}