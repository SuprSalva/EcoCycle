import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/services/notification.service';
import * as XLSX from 'xlsx';

export interface SesionReciclaje {
  id: string;
  usuarioId: string;
  maquinaId: string;
  botellas: number;
  puntos: number;
  fecha: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent implements OnInit {
  sesiones: SesionReciclaje[] = [];
  cargando: boolean = true;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSesiones();
  }

  cargarSesiones(): void {
    this.cargando = true;
    this.notificationService.showLoading('Cargando reportes...', 'Obteniendo reportes desde la base de datos');
    this.http.get<any>(`${environment.apiUrl}/SesionReciclaje/todas`).subscribe({
      next: (res) => {
        if (res && res.succeeded) {
          // Ordenar por fecha descendente
          this.sesiones = res.data.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
        this.cargando = false;
        this.notificationService.hideLoading();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Error', 'No se pudieron cargar los reportes.');
        this.cargando = false;
        this.notificationService.hideLoading();
      }
    });
  }

  exportarExcel(): void {
    if (this.sesiones.length === 0) {
      this.notificationService.warning('Atención', 'No hay datos para exportar.');
      return;
    }

    const data = this.sesiones.map(s => ({
      'ID Sesión': s.id,
      'Usuario (ID)': s.usuarioId,
      'Máquina IoT': s.maquinaId || 'MÁQUINA-01',
      'Botellas Recicladas': s.botellas,
      'EcoPuntos Generados': s.puntos,
      'Fecha y Hora': new Date(s.fecha).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const wscols = [
      { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 25 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sesiones Reciclaje');

    XLSX.writeFile(workbook, 'reporte_reciclaje_ecocycle.xlsx');
  }
}
