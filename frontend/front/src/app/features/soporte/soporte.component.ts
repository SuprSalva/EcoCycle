// 📁 src/app/features/soporte/soporte.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoporteService, ComentarioItem } from '../../core/services/soporte.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss']
})
export class SoporteComponent implements OnInit {
  
  public misComentarios: ComentarioItem[] = [];
  public comentariosFiltrados: ComentarioItem[] = [];
  public filtroBusqueda: string = '';
  public cargando: boolean = false;
  public esAdmin: boolean = false;
  
  public nuevoComentario: ComentarioItem = {
    asunto: '',
    mensaje: '',
    categoria: 'Sugerencia'
  };
  public mostrandoFormulario: boolean = false;

  constructor(
    private soporteService: SoporteService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.verificarRol();
  }

  verificarRol(): void {
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (perfil: any) => {
        const rol = (perfil?.rol || '').toLowerCase();
        this.esAdmin = rol === 'admin' || rol === 'administrador';
        this.cargarHistorialComentarios();
      },
      error: () => {
        this.esAdmin = false;
        this.cargarHistorialComentarios();
      }
    });
  }

  cargarHistorialComentarios(): void {
    this.cargando = true;

    const observable = this.esAdmin 
      ? this.soporteService.obtenerTodosLosComentarios()
      : this.soporteService.obtenerMisComentarios();

    observable.subscribe({
      next: (response: any) => {
        this.cargando = false;
        if (response && response.suceso) {
          this.misComentarios = response.data || [];
        } else if (response && response.data) {
          this.misComentarios = response.data;
        } else {
          this.misComentarios = [];
        }
        this.comentariosFiltrados = [...this.misComentarios];
        console.log('📋 Comentarios cargados:', this.misComentarios);
      },
      error: (error: any) => {
        console.warn('Error al cargar comentarios.', error);
        this.cargando = false;
        this.misComentarios = [];
        this.comentariosFiltrados = [];
        
        // Datos de respaldo para desarrollo
        if (this.esAdmin) {
          this.misComentarios = [
            {
              id: '1',
              email: 'cliente1@gmail.com',
              asunto: 'Sugerencia de incentivos',
              mensaje: 'Me gustaría que se añadan más sucursales de canje de cupones en la zona norte.',
              categoria: 'Sugerencia',
              estatus: 'Recibido'
            },
            {
              id: '2',
              email: 'usuario_eco@hotmail.com',
              asunto: 'Falla en lector IoT',
              mensaje: 'La máquina de la plaza central no reconoció el código QR de mi cuenta.',
              categoria: 'Reporte de Fallo',
              estatus: 'En revisión'
            }
          ];
          this.comentariosFiltrados = [...this.misComentarios];
        }
      }
    });
  }

  recargarComentarios(): void {
    this.cargarHistorialComentarios();
    this.notificationService.toastSuccess('Comentarios actualizados');
  }

  aplicarFiltro(): void {
    const busqueda = this.filtroBusqueda.toLowerCase().trim();
    if (!busqueda) {
      this.comentariosFiltrados = [...this.misComentarios];
      return;
    }
    
    this.comentariosFiltrados = this.misComentarios.filter((item: ComentarioItem) => 
      item.asunto?.toLowerCase().includes(busqueda) ||
      item.mensaje?.toLowerCase().includes(busqueda) ||
      item.email?.toLowerCase().includes(busqueda) ||
      item.categoria?.toLowerCase().includes(busqueda)
    );
  }

  cambiarEstatus(item: ComentarioItem): void {
    if (!item.id) return;
    
    this.soporteService.actualizarComentario(item.id, {
      estatus: item.estatus
    }).subscribe({
      next: () => {
        this.notificationService.toastSuccess(`Estado actualizado a "${item.estatus}"`);
      },
      error: (error: any) => {
        console.error('Error al actualizar estado:', error);
        this.notificationService.error('Error', 'No se pudo actualizar el estado.');
        this.cargarHistorialComentarios();
      }
    });
  }

  eliminarComentario(item: ComentarioItem): void {
    if (!item.id) return;
    
    this.notificationService.confirmAction(
      'Eliminar comentario',
      '¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      '#dc3545'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.soporteService.eliminarComentario(item.id!).subscribe({
          next: () => {
            this.notificationService.toastSuccess('Comentario eliminado');
            this.cargarHistorialComentarios();
          },
          error: (error: any) => {
            console.error('Error al eliminar:', error);
            this.notificationService.error('Error', 'No se pudo eliminar el comentario.');
          }
        });
      }
    });
  }

  responderComentario(item: ComentarioItem): void {
    this.notificationService.showLoading('Responder', `Preparando respuesta para: ${item.asunto}`);
    setTimeout(() => {
      this.notificationService.hideLoading();
      this.notificationService.warning('Próximamente', 'La función de responder estará disponible pronto.');
    }, 1000);
  }

  enviarComentario(): void {
    const asunto = this.nuevoComentario.asunto?.trim();
    const mensaje = this.nuevoComentario.mensaje?.trim();

    if (!asunto || !mensaje) {
      this.notificationService.warning('Campos Incompletos', 'Por favor completa todos los campos.');
      return;
    }

    this.cargando = true;
    this.notificationService.showLoading('Enviando...', 'Guardando tu comentario');

    const payload = {
      asunto: asunto,
      mensaje: mensaje,
      categoria: this.nuevoComentario.categoria || 'Sugerencia'
    };

    console.log('📤 Enviando payload:', payload);

    this.soporteService.crearComentario(payload).subscribe({
      next: (response: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        
        console.log('📥 Respuesta del servidor:', response);
        
        if (response?.suceso === true) {
          this.notificationService.toastSuccess('¡Comentario enviado exitosamente!');
          this.nuevoComentario = { asunto: '', mensaje: '', categoria: 'Sugerencia' };
          this.mostrandoFormulario = false;
          this.cargarHistorialComentarios();
        } else {
          const mensajeError = response?.message || 'No se pudo enviar el comentario.';
          this.notificationService.error('Error', mensajeError);
        }
      },
      error: (error: any) => {
        this.cargando = false;
        this.notificationService.hideLoading();
        console.error('❌ Error detallado:', error);
        
        let mensajeError = 'No se pudo conectar con el servidor.';
        if (error.error?.errors) {
          const errores = Object.values(error.error.errors).flat();
          mensajeError = errores.join(', ');
        } else if (error.error?.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        this.notificationService.error('Error al enviar', mensajeError);
      }
    });
  }

  formatFecha(fecha: any): string {
    if (!fecha) return 'Fecha no disponible';
    
    if (fecha.seconds !== undefined) {
      return new Date(fecha.seconds * 1000).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (typeof fecha === 'string') {
      return fecha;
    }
    
    if (fecha instanceof Date) {
      return fecha.toLocaleString('es-MX');
    }
    
    return 'Fecha no disponible';
  }

  toggleFormulario(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario;
  }
}