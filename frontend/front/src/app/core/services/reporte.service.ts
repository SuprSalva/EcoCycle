import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {

  private readonly API_URL = `${environment.apiUrl}/Reportes`;

  constructor(private http: HttpClient) {}

  obtenerReportes(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }

  obtenerReportePorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  crearReporte(datos: any): Observable<any> {
    return this.http.post<any>(this.API_URL, datos);
  }

  actualizarReporte(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, datos);
  }

  eliminarReporte(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }
}