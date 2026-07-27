import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cotizacion } from '../../models/cotizacion.model';

@Injectable({
  providedIn: 'root'
})

export class CotizacionesService {

  private apiUrl = `${environment.apiUrl}/Cotizacion`;

  constructor(private http: HttpClient) { }

  crear(cotizacion: Cotizacion): Observable<any> {
    return this.http.post<any>(this.apiUrl, cotizacion);
  }

  obtenerTodas(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<Cotizacion> {
    return this.http.get<Cotizacion>(`${this.apiUrl}/${id}`);
  }

  actualizarEstatus(id: string, estatus: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estatus`, { id, estatus });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}