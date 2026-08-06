import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import {DashboardService,DashboardResumen,UltimaSesion,TerminalIoT} from '../../core/services/dashboard.service';

import { NotificationService } from '../../core/services/notification.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-global',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-global.component.html',
  styleUrl: './dashboard-global.component.scss'
})
export class DashboardGlobalComponent implements OnInit, AfterViewInit {

  @ViewChild('areaChart') areaChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;

  resumen: DashboardResumen = {
    totalBotellas: 0,
    totalPuntosEmitidos: 0,
    totalUsuarios: 0,
    totalCanjes: 0,
    grafica: [],
    stockMateriaPrima: [],
    ultimasSesiones: [],
    terminales: []
  };

  cargando = true;

  ultimasSesiones: UltimaSesion[] = [];

  terminales: TerminalIoT[] = [];

  chart?: Chart;
  pieChartInstance?: Chart;

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  ngAfterViewInit(): void {
    // Esperamos a que lleguen los datos
  }

  cargarDashboard(): void {

    this.dashboardService.getResumen().subscribe({
      next: (data) => {
        console.log("Dashboard:", data);
        this.resumen = data;
        this.ultimasSesiones = data.ultimasSesiones;
        this.terminales = data.terminales ?? [];
        this.cargando = false;
        setTimeout(() => {
          this.crearGrafica();
          this.crearGraficaPastel();
        });
      },

      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.notificationService.error("No fue posible cargar el dashboard");
      }
    });
  }

  crearGrafica(): void {

    if (!this.areaChart) return;
  
    if (this.chart) {
      this.chart.destroy();
    }
  
    this.chart = new Chart(this.areaChart.nativeElement, {
  
      type: 'line',
  
      data: {
  
        labels: this.resumen.grafica.map(x => x.dia),
  
        datasets: [
  
          {
  
            label: 'Botellas recicladas',
  
            data: this.resumen.grafica.map(x => x.cantidad),
  
            fill: true,
  
            tension: 0.4,
  
            borderWidth: 3,
  
            borderColor: '#22c55e',
  
            backgroundColor: 'rgba(34,197,94,0.20)',
  
            pointRadius: 5,
  
            pointHoverRadius: 7,
  
            pointBackgroundColor: '#22c55e'
  
          }
  
        ]
  
      },
  
      options: {
  
        responsive: true,
  
        maintainAspectRatio: false,
  
        plugins: {
  
          legend: {
  
            display: false
  
          }
  
        },
  
        scales: {
  
          x: {
  
            grid: {
  
              display: false
  
            }
          },
  
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  crearGraficaPastel(): void {

    if (!this.pieChart) return;

    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
    }

    this.pieChartInstance = new Chart(this.pieChart.nativeElement, {
      type: 'pie',
      data: {
        labels: this.resumen.stockMateriaPrima.map(x => x.nombre),
        datasets: [

          {
            data: this.resumen.stockMateriaPrima.map(x => x.stockActual)
          }
        ]
      },

      options: {

        responsive: true,
        maintainAspectRatio: false

      }
    });
  }
}