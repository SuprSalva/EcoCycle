<<<<<<< HEAD
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificacionesApiService, NotificacionResponse } from '../../../core/services/notificaciones-api.service';
=======
// navbar.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';  // ✅ ¡IMPORTANTE!
>>>>>>> origin/nueva-roles

@Component({
  selector: 'app-navbar',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
=======
  imports: [CommonModule, RouterModule],  // ✅ Agregar RouterModule
>>>>>>> origin/nueva-roles
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Input() perfil: any;
  @Output() logout = new EventEmitter<void>();

  showNotifications = false;
  notificaciones: NotificacionResponse[] = [];
  unreadCount = 0;

  constructor(
    private notificacionesApi: NotificacionesApiService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
<<<<<<< HEAD
    this.cargarNotificaciones();
=======
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isLightTheme = true;
      document.body.classList.add('light-theme');
    }
>>>>>>> origin/nueva-roles
  }

  cargarNotificaciones() {
    this.notificacionesApi.getMisNotificaciones().subscribe({
      next: (res) => {
        if (res.success) {
          // Sort notifications by date descending
          this.notificaciones = res.data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          this.unreadCount = this.notificaciones.filter(n => !n.leida).length;
        }
      },
      error: (err) => console.error('Error cargando notificaciones navbar', err)
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    // We could reload on toggle if we want the freshest data:
    if (this.showNotifications) {
      this.cargarNotificaciones();
    }
  }

  onLogout() {
    this.logout.emit();
  }
<<<<<<< HEAD

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    const ahora = new Date();
    const difMs = ahora.getTime() - d.getTime();
    const difHoras = Math.floor(difMs / (1000 * 60 * 60));
    const difMinutos = Math.floor(difMs / (1000 * 60));
    
    if (difMinutos < 60) {
      if (difMinutos <= 1) return 'Hace un momento';
      return `Hace ${difMinutos}m`;
    }
    if (difHoras < 24) {
      return `Hace ${difHoras}h`;
    }
    return this.datePipe.transform(d, 'dd/MM/yy') || fecha;
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
=======
}
>>>>>>> origin/nueva-roles
