import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  perfil: any = null;
  esAdmin = false;

  darkMode = false;
  notifReciclaje = true;
  notifPromociones = false;
  notifSonido = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.perfil = this.authService.obtenerUsuarioActual();
    this.esAdmin = this.authService.esAdministrador();
    this.cargarPreferencias();
  }

  cargarPreferencias(): void {
    const saved = localStorage.getItem('ecocycle_config');
    if (saved) {
      const cfg = JSON.parse(saved);
      this.darkMode = cfg.darkMode ?? false;
      this.notifReciclaje = cfg.notifReciclaje ?? true;
      this.notifPromociones = cfg.notifPromociones ?? false;
      this.notifSonido = cfg.notifSonido ?? true;
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
    this.guardarTodo();
  }

  guardarTodo(): void {
    const cfg = {
      darkMode: this.darkMode,
      notifReciclaje: this.notifReciclaje,
      notifPromociones: this.notifPromociones,
      notifSonido: this.notifSonido,
    };
    localStorage.setItem('ecocycle_config', JSON.stringify(cfg));
    this.notificationService.toastSuccess('Preferencias guardadas.');
  }
}
