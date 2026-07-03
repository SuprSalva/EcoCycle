// 📁 src/app/features/dashboard-cliente/dashboard-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,  // ✅ IMPORTANTE: Debe ser standalone
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
      next: (datos: any) => {
        this.perfil = datos;
        this.cargarEstadisticas();
      },
      error: (err: any) => {
        console.error('Error al obtener perfil', err);
        // Datos de respaldo para que se vea algo
        this.perfil = {
          nombre: 'Cliente',
          apellidos: '',
          email: 'cliente@ecocycle.com',
          rol: 'cliente',
          saldoPuntos: 0
        };
        this.cargarEstadisticas();
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