import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardResumen } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-global',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-global.component.html',
  styleUrl: './dashboard-global.component.scss'
})
export class DashboardGlobalComponent implements OnInit {
  resumen: DashboardResumen = {
    totalBotellas: 0,
    totalPuntosEmitidos: 0,
    totalUsuarios: 0,
    totalCanjes: 0,
    grafica: []
  };
  
  cargando = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getResumen().subscribe({
      next: (data) => {
        if (data) {
          this.resumen = data;
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando resumen del dashboard', err);
        this.cargando = false;
      }
    });
  }
}
