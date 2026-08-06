import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface MetricasBotellas {
  usuariosActivos: number;
  puntosGenerados: number;
  botellasRecicladas: number;
  maquinasActivas: number;
}

@Component({
  selector: 'app-dashboard-botellas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-botellas.component.html',
  styleUrls: ['./dashboard-botellas.component.scss']
})
export class DashboardBotellasComponent implements OnInit, AfterViewChecked {
  cargando: boolean = true;
  metricas: MetricasBotellas = { usuariosActivos: 0, puntosGenerados: 0, botellasRecicladas: 0, maquinasActivas: 2 };
  graficaInicializada: boolean = false;
  chartInstance: any;

  // Propiedades declaradas correctamente para el HTML
  usuariosTabla: any[] = [];
  historialGlobalSimulado: any[] = [];

  private readonly API_USUARIOS = `${environment.apiUrl}/Usuario/todos`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  ngAfterViewChecked(): void {
    if (!this.cargando && !this.graficaInicializada) {
      this.inicializarGraficaBarras();
    }
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.graficaInicializada = false;
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(this.API_USUARIOS, { headers }).subscribe({
      next: (respuesta) => {
        const listaUsuarios = respuesta.data || respuesta || [];
        
        // Ordenamos el Top 5 de recicladores por puntos descendente
        this.usuariosTabla = [...listaUsuarios]
          .sort((a, b) => (b.saldoPuntos || 0) - (a.saldoPuntos || 0))
          .slice(0, 5);

        const totalUsuarios = listaUsuarios.length;
        const totalPuntosCarteras = listaUsuarios.reduce((sum: number, user: any) => sum + (user.saldoPuntos || 0), 0);
        const estimacionBotellas = Math.round(totalPuntosCarteras / 0.10);

        this.metricas = {
          usuariosActivos: totalUsuarios,
          puntosGenerados: Number(totalPuntosCarteras.toFixed(2)),
          botellasRecicladas: estimacionBotellas,
          maquinasActivas: 2
        };

        // Construimos el historial mapeando los saldos reales de tu C#
        this.historialGlobalSimulado = listaUsuarios.map((u: any) => {
          const botellasUser = Math.round((u.saldoPuntos || 0) / 0.10);
          return {
            usuario: `${u.nombre} ${u.apellidos}`,
            email: u.email,
            accion: `Tiene acumuladas ${botellasUser} botellas en su historial`,
            impacto: `+${u.saldoPuntos || 0} EcoPts`,
            rol: u.rol || 'Cliente'
          };
        });

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al mapear base de datos:', err);
        Swal.fire('Error', 'No se pudieron recuperar las métricas desde C#.', 'error');
      }
    });
  }

  inicializarGraficaBarras(): void {
    const canvas = document.getElementById('graficaBarrasReciclaje') as HTMLCanvasElement;
    if (!canvas) return;

    this.graficaInicializada = true;

    if (this.chartInstance) this.chartInstance.destroy();

    const nombresTop = this.usuariosTabla.map(u => u.nombre || 'Anónimo');
    const puntosTop = this.usuariosTabla.map(u => Math.round((u.saldoPuntos || 0) / 0.10));

    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: nombresTop.length > 0 ? nombresTop : ['Sin datos'],
        datasets: [{
          label: 'Botellas Totales Recicladas',
          data: puntosTop.length > 0 ? puntosTop : [0], // 👈 Corrección aquí: cambiado pointsTop por puntosTop
          backgroundColor: '#2563eb',
          borderRadius: 6,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }

  generarReporteAnalisis(): void {
    Swal.fire('Generando Excel...', 'Exportando base de datos consolidada de rendimientos.', 'success');
  }
}