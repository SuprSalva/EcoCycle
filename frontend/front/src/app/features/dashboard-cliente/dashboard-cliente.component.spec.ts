// 📁 src/app/features/dashboard-cliente/dashboard-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-cliente.component.html',
  styleUrl: './dashboard-cliente.component.scss'
})
export class DashboardClienteComponent implements OnInit {
  perfil: any = null;
  estadisticas = {
    totalReciclado: 0,
    puntosAcumulados: 0,
    canjesRealizados: 0
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (datos) => {
        this.perfil = datos;
        this.cargarEstadisticas();
      },
      error: (err) => {
        console.error('Error al obtener perfil', err);
      }
    });
  }

  cargarEstadisticas() {
    // TODO: Conectar con backend para estadísticas del cliente
    this.estadisticas = {
      totalReciclado: 150,
      puntosAcumulados: 250,
      canjesRealizados: 3
    };
  }
}