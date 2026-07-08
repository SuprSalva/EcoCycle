import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BarComponent } from '../../shared/components/bar/bar.component';
import { ComentariosService } from '../../core/services/comentario.service'; 
import { NotificationService } from '../../core/services/notification.service';
import { Comentario } from '../../models/comentario.model';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    CommonModule,
    BarComponent,
    ReactiveFormsModule
  ],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss'
})

export class ProductoComponent implements OnInit {


  public mainImage = signal<string>('/maquina1.jpg');

  public currentDate: string = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  comentarioForm: FormGroup;
  cargando = false;

  public listaComentarios: Comentario[] = [];
  public cargandoComentarios: boolean = true;

  constructor(
    private fb: FormBuilder,
    private comentariosService: ComentariosService,
    private notificationService: NotificationService 
  ) {

 
    this.comentarioForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mensaje: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ],
      estrellas: [5, [Validators.required, Validators.min(1), Validators.max(5)]] 
    });

    
  }

  ngOnInit(): void {
    this.cargarOpinionesPublicas();
  }

  private cargarOpinionesPublicas(): void {
    this.comentariosService.obtenerPublicos().subscribe({
      next: (comentarios) => {
        this.listaComentarios = comentarios;
        this.cargandoComentarios = false;
      },
      error: (err) => {
        console.error('Error al cargar las opiniones de la comunidad', err);
        this.cargandoComentarios = false;
      }
    });
  }

  public obtenerIniciales(email: string): string {
    if (!email) return '??';
    const usuario = email.split('@')[0];
    return usuario.substring(0, 2).toUpperCase();
  }

  public formatearEmail(email: string): string {
    if (!email) return 'Usuario de EcoCycle';
    const partes = email.split('@');
    const nombreUsuario = partes[0];
    const dominio = partes[1];
    if (nombreUsuario.length <= 2) return `***@${dominio}`;
    return `${nombreUsuario.substring(0, 2)}***@${dominio}`;
  }

  /**
   * Cambia la imagen principal del showcase
   */
  public changeImage(newSrc: string): void {
    this.mainImage.set(newSrc);
  }

  enviarComentario(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    
    // Mostramos el indicador visual de carga antes de la petición
    if (this.notificationService.showLoading) {
      this.notificationService.showLoading();
    }

    this.comentariosService.crear(this.comentarioForm.value)
      .subscribe({
        next: (response) => {
          console.log(response);

          this.notificationService.hideLoading();
          
          this.notificationService.success(
            'Mensaje enviado',
            response.mensaje || 'Nos pondremos en contacto contigo lo antes posible.'
          );

          this.comentarioForm.reset({ estrellas: 5 });
          this.cargando = false;
          this.cargarOpinionesPublicas();
        },
        error: (error) => {
          console.error(error);

          this.notificationService.hideLoading();

          this.notificationService.error(
            'Error',
            'Ocurrió un error al enviar el mensaje.'
          );

          this.cargando = false;
        }
      });
  }
}