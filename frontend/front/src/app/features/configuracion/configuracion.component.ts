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

  notifReciclaje = true;
  notifPromociones = false;
  notifSonido = true;

  compacto = false;
  dashboardBotellas = true;
  dashboardPuntos = true;
  dashboardSesiones = true;

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
      this.notifReciclaje = cfg.notifReciclaje ?? true;
      this.notifPromociones = cfg.notifPromociones ?? false;
      this.notifSonido = cfg.notifSonido ?? true;
      this.compacto = cfg.compacto ?? false;
      this.dashboardBotellas = cfg.dashboardBotellas ?? true;
      this.dashboardPuntos = cfg.dashboardPuntos ?? true;
      this.dashboardSesiones = cfg.dashboardSesiones ?? true;
    }
  }

  guardarTodo(): void {
    const cfg = {
      notifReciclaje: this.notifReciclaje,
      notifPromociones: this.notifPromociones,
      notifSonido: this.notifSonido,
      compacto: this.compacto,
      dashboardBotellas: this.dashboardBotellas,
      dashboardPuntos: this.dashboardPuntos,
      dashboardSesiones: this.dashboardSesiones,
    };
    localStorage.setItem('ecocycle_config', JSON.stringify(cfg));
    this.notificationService.toastSuccess('Preferencias guardadas.');
  }

  get maquinaId(): string {
    return 'MQ-ECO-01';
  }

  get visorUrl(): string {
    return '104.248.187.43:3000';
  }

  get yoloThreshold(): string {
    return '0.15';
  }
}
