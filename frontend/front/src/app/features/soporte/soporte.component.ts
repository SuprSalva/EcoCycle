import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SoporteService, ComentarioItem } from '../../core/services/soporte.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss']
})
export class SoporteComponent implements OnInit {
  
  // Lista donde se almacenarán las valoraciones de los clientes
  public misComentarios: ComentarioItem[] = [];
  public cargando: boolean = false;

  constructor(
    private soporteService: SoporteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarHistorialComentarios();
  }

  cargarHistorialComentarios(): void {
    this.cargando = true;

    this.soporteService.obtenerTodosLosComentarios().subscribe({
      next: (response) => {
        if (response && response.succeeded) {
          this.misComentarios = response.data || [];
        } else {
          this.misComentarios = response.data || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.warn('Error al conectar con el servidor. Usando datos de respaldo.', error);
        this.cargando = false;
        
        // MockData adaptados para la vista de administración por si la API aún no responde
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
    });
  }
}