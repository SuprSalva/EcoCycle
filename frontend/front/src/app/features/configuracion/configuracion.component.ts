import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  perfil: any = null;
  seccion = 'privacidad';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.perfil = this.authService.obtenerUsuarioActual();
  }
}
