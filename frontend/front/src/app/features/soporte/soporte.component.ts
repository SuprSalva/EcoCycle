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
  public cargando: boolean = false;
  public esAdmin: boolean = false;
  
  // Para el formulario de nuevo comentario (si permites que los usuarios creen desde aquí)
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
      next: (perfil) => {
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

    // Si es admin, carga todos los comentarios
    // Si no es admin, carga solo los suyos (o no carga ninguno si es solo vista admin)
    const observable = this.esAdmin 
      ? this.soporteService.obtenerTodosLosComentarios()
      : this.soporteService.obtenerMisComentarios();

    observable.subscribe({
      next: (response) => {
        if (response && response.succeeded) {
          this.misComentarios = response.data || [];
        } else {
          this.misComentarios = response.data || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.warn('Error al cargar comentarios.', error);
        this.cargando = false;
        
        // Datos de respaldo (solo para desarrollo)
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
              mensaje: 'La máquina de la plaza central no reconoció el código QR de mi cuenta admin.',
              categoria: 'Falla de Máquina',
              estatus: 'En revisión'
            }
          ];
        }
      }
    });
  }

  // Método para formatear fechas
  formatFecha(fecha: any): string {
    if (!fecha) return 'Fecha no disponible';
    
    // Si es un Timestamp de Firestore
    if (fecha.seconds !== undefined) {
      return new Date(fecha.seconds * 1000).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Si es un string
    if (typeof fecha === 'string') {
      return fecha;
    }
    
    // Si es un objeto Date
    if (fecha instanceof Date) {
      return fecha.toLocaleString('es-MX');
    }
    
    return 'Fecha no disponible';
  }

  // Método para enviar comentario (si permites que los usuarios creen desde aquí)
  enviarComentario(): void {
    if (!this.nuevoComentario.asunto || !this.nuevoComentario.mensaje) {
      this.notificationService.warning('Campos Incompletos', 'Por favor completa todos los campos.');
      return;
    }

    this.cargando = true;
    this.soporteService.crearComentario(this.nuevoComentario).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.succeeded) {
          this.notificationService.toastSuccess('¡Comentario enviado exitosamente!');
          this.nuevoComentario = { asunto: '', mensaje: '', categoria: 'Sugerencia' };
          this.mostrandoFormulario = false;
          this.cargarHistorialComentarios(); // Recargar la lista
        } else {
          this.notificationService.error('Error', response.message || 'No se pudo enviar el comentario.');
        }
      },
      error: (error) => {
        this.cargando = false;
        this.notificationService.error('Error', 'No se pudo conectar con el servidor.');
        console.error(error);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario;
  }
}