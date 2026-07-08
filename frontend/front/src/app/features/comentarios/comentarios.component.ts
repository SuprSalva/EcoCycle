import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ComentariosService } from '../../core/services/comentario.service'; 
import { NotificationService } from '../../core/services/notification.service'; 
import { Comentario } from '../../models/comentario.model';


@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule
  ],
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.scss'
})
export class ComentariosComponent implements OnInit {
  
  public comentarios: Comentario[] = [];
  public comentariosFiltrados: Comentario[] = [];

  public cargando: boolean = false;
  public mostrarFormulario: boolean = false;
  public modalAbierto: boolean = false;
  
  public terminoBusqueda: string = '';
  public filtroEstatus: string = 'Todos';

  public comentarioForm: FormGroup;
  public comentarioSeleccionado: Comentario | null = null;
  public textoRespuesta: string = '';

  constructor(
    private fb: FormBuilder,
    private comentariosService: ComentariosService,
    private notificationService: NotificationService
  ) {
    this.comentarioForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      estrellas: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.cargarComentarios();
  }

  public cargarComentarios(): void {
    this.cargando = true;
    if (this.notificationService.showLoading) this.notificationService.showLoading();

    this.comentariosService.obtenerTodos().subscribe({
      next: (data) => {
        this.comentarios = data;
        this.filtrarComentarios(); 
        this.notificationService.hideLoading();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudieron cargar los comentarios.');
        this.cargando = false;
      }
    });
  }

  public filtrarComentarios(): void {
    this.comentariosFiltrados = this.comentarios.filter(comentario => {
      const coincideEstatus = this.filtroEstatus === 'Todos' || 
                              (comentario.estatus || 'En revisión') === this.filtroEstatus;

                              const termino = this.terminoBusqueda.toLowerCase().trim();
      const coincideTexto = !termino || 
                            comentario.email.toLowerCase().includes(termino) || 
                            comentario.mensaje.toLowerCase().includes(termino);

      return coincideEstatus && coincideTexto;
    });
  }

  public cambiarFiltroEstatus(estatus: string): void {
    this.filtroEstatus = estatus;
    this.filtrarComentarios();
  }

  public totalPorEstatus(estatus: string): number {
    return this.comentarios.filter(c => (c.estatus || 'En revisión') === estatus).length;
  }

  public toggleVisibilidad(comentario: Comentario): void {
    if (!comentario.id) return;

    const estadoAnterior = !comentario.esPublico;
    const nuevoEstado = comentario.esPublico ?? false;

    this.comentariosService.cambiarVisibilidad(comentario.id, nuevoEstado).subscribe({
      next: (res) => {
        this.notificationService.success('Visibilidad', res.mensaje || 'Estado actualizado.');
      },
      error: (err) => {
        console.error(err);
        comentario.esPublico = estadoAnterior; // Rollback visual
        this.notificationService.error('Error', 'No se pudo cambiar la visibilidad.');
      }
    });
  }

  /**
   * Cambia el estatus desde el elemento <select> de la tabla
   */
  public cambiarEstatus(comentario: Comentario, nuevoEstatus: string): void {
    if (!comentario.id) return;

    const estatusAnterior = comentario.estatus;
    comentario.estatus = nuevoEstatus;

    this.comentariosService.actualizar(comentario.id, comentario).subscribe({
      next: () => {
        this.notificationService.success('Estatus', `Marcado como ${nuevoEstatus}`);
        this.filtrarComentarios(); // Re-filtrar por si cambió de categoría
      },
      error: (err) => {
        console.error(err);
        comentario.estatus = estatusAnterior; // Rollback
        this.notificationService.error('Error', 'No se pudo cambiar el estatus.');
      }
    });
  }

  /**
   * Crea un nuevo comentario directamente desde el panel de administración
   */
  public enviarComentario(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    if (this.notificationService.showLoading) this.notificationService.showLoading();

    // Seteamos valores por defecto de administración al crear uno nuevo
    const nuevoComentario = {
      ...this.comentarioForm.value,
      esPublico: false,
      estatus: 'En revisión'
    };

    this.comentariosService.crear(nuevoComentario).subscribe({
      next: () => {
        this.notificationService.hideLoading();
        this.notificationService.success('Éxito', 'Comentario administrativo guardado.');
        this.comentarioForm.reset({ estrellas: 5 });
        this.mostrarFormulario = false;
        this.cargarComentarios(); // Recargamos la lista
      },
      error: (err) => {
        console.error(err);
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudo crear el comentario.');
        this.cargando = false;
      }
    });
  }

 public eliminarComentario(id: string | undefined, event: Event): void {
  event.stopPropagation(); // 

  if (!id) return;

  if (confirm('¿Estás seguro de eliminar este comentario permanentemente?')) {
    if (this.notificationService.showLoading) this.notificationService.showLoading();

    this.comentariosService.eliminar(id).subscribe({
      next: () => {
        this.notificationService.hideLoading();
        this.notificationService.success('Eliminado', 'El comentario ha sido removido.');
        this.comentarios = this.comentarios.filter(c => c.id !== id);
        this.filtrarComentarios();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudo eliminar.');
      }
    });
  }
}

  public abrirModal(comentario: Comentario): void {
    this.comentarioSeleccionado = comentario;
    // Si ya tenías guardada una respuesta en la base de datos la puedes cargar aquí, si no, se inicializa vacía
    this.textoRespuesta = (comentario as any).respuestaAdmin || '';
    this.modalAbierto = true;
  }

  public cerrarModal(): void {
    this.modalAbierto = false;
    this.comentarioSeleccionado = null;
    this.textoRespuesta = '';
  }

  public enviarRespuesta(): void {
    if (!this.comentarioSeleccionado || !this.comentarioSeleccionado.id) return;
  
    this.cargando = true;
    if (this.notificationService.showLoading) this.notificationService.showLoading();
    
    // Consumimos el nuevo endpoint de .NET
    this.comentariosService.enviarResolucion(
      this.comentarioSeleccionado.id,
      'Usuario Anónimo', // O puedes pasar comentarioSeleccionado.nombre si manejas el campo
      this.comentarioSeleccionado.mensaje,
      this.textoRespuesta
    ).subscribe({
      next: (res) => {
        this.notificationService.hideLoading();
        this.notificationService.success('Resolución Registrada', 'Se guardó la respuesta y se envió el correo al usuario.');
        
        this.cerrarModal();
        this.cargarComentarios(); // Recargamos la tabla para ver el estatus "Resuelto" reflejado en tiempo real
      },
      error: (err) => {
        console.error(err);
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudo registrar la respuesta ni enviar el correo.');
        this.cargando = false;
      }
    });
  }

  public mapearEstrellas(cantidad: number): string {
    const validCantidad = Math.max(1, Math.min(5, cantidad || 5));
    return '★'.repeat(validCantidad) + '☆'.repeat(5 - validCantidad);
  }
}