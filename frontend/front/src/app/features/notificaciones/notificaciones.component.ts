import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificacionesApiService, NotificacionResponse } from '../../core/services/notificaciones-api.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: NotificacionResponse[] = [];
  cargando = true;

  constructor(
    private notificacionesApi: NotificacionesApiService,
    private notificationAlert: NotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    this.cargando = true;
    this.notificacionesApi.getMisNotificaciones().subscribe({
      next: (res) => {
        if (res.suceso) {
          // Sort notifications by date descending
          this.notificaciones = res.data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando notificaciones', err);
        this.cargando = false;
        this.notificationAlert.toastError('No se pudieron cargar las notificaciones');
      }
    });
  }
  
  marcarTodasComoLeidas() {
    // Only call API if there are unread notifications
    const unreadCount = this.notificaciones.filter(n => !n.leida).length;
    if (unreadCount === 0) return;

    this.notificacionesApi.marcarComoLeidas().subscribe({
      next: (res) => {
        if (res.suceso) {
          this.notificaciones.forEach(n => n.leida = true);
          this.notificationAlert.toastSuccess('Todas las notificaciones marcadas como leídas');
        }
      },
      error: (err) => {
        console.error('Error al marcar leídas', err);
        this.notificationAlert.toastError('No se pudieron marcar como leídas');
      }
    });
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    const ahora = new Date();
    const difMs = ahora.getTime() - d.getTime();
    const difHoras = Math.floor(difMs / (1000 * 60 * 60));
    
    if (difHoras < 24) {
      if (difHoras === 0) return 'Hace un momento';
      return `Hace ${difHoras} ${difHoras === 1 ? 'hora' : 'horas'}`;
    }
    return this.datePipe.transform(d, 'dd/MM/yyyy HH:mm') || fecha;
  }

  getIcono(icono: string): string {
    const iconLower = (icono || '').toLowerCase();
    if (iconLower.includes('recompensa') || iconLower.includes('gift')) return 'fa-solid fa-gift text-success';
    if (iconLower.includes('alerta') || iconLower.includes('warning') || iconLower.includes('bajo')) return 'fa-solid fa-triangle-exclamation text-warning';
    if (iconLower.includes('error') || iconLower.includes('suspendido')) return 'fa-solid fa-ban text-danger';
    if (iconLower.includes('reciclaje') || iconLower.includes('recycling')) return 'fa-solid fa-recycle text-success';
    return 'fa-solid fa-bell text-primary';
  }
}
