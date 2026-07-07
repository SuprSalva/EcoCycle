import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes-nucleo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-nucleo.component.html',
  styleUrls: ['./reportes-nucleo.component.scss']
})
export class ReportesNucleoComponent implements OnInit {
  puntosGenerados: number = 0;
  puntosCanjeados: number = 0;
  balanceSistema: number = 0;
  
  historialEventos: any[] = [];
  cargando: boolean = false;

  private readonly API_HISTORIAL = 'http://localhost:5171/api/Usuario/historial';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarHistorialMaestro();
  }

  cargarHistorialMaestro(): void {
    this.cargando = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(this.API_HISTORIAL, { headers }).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        
        // C# devuelve la lista envuelta en un ApiResponse (usualmente bajo 'data')
        const dataBruta = respuesta.data || respuesta || [];
        
        // Mapeamos los campos del backend a tipos limpios para el HTML
        this.historialEventos = dataBruta.map((evento: any) => {
          // Extraemos el valor numérico de un string como "+0.1 pts" o "-10 pts"
          let puntosNumericos = 0;
          if (evento.puntos) {
            const limpio = String(evento.puntos).replace(/[^0-9.]/g, '');
            puntosNumericos = Number(limpio) || 0;
          }

          return {
            id: evento.id,
            titulo: evento.titulo || 'Operación',
            subtitulo: evento.subtitulo || '',
            puntosValor: puntosNumericos, // Guardamos el número puro para los cálculos y pipes
            esPositivo: evento.esPositivo, // Booleano nativo de tu C#
            fecha: evento.fecha
          };
        });
        
        this.calcularConciliacion();
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al recuperar el historial unificado:', err);
        Swal.fire('Error de Auditoría', 'No se pudieron consolidar los reportes del núcleo.', 'error');
      }
    });
  }

  calcularConciliacion(): void {
    let generados = 0;
    let canjeados = 0;

    this.historialEventos.forEach(evento => {
      if (evento.esPositivo) {
        generados += evento.puntosValor;
      } else {
        canjeados += evento.puntosValor;
      }
    });

    this.puntosGenerados = Number(generados.toFixed(2));
    this.puntosCanjeados = Number(canjeados.toFixed(2));
    this.balanceSistema = Number((generados - canjeados).toFixed(2));
  }
}