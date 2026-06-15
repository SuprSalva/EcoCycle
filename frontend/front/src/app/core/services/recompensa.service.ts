import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Recompensa {
  id: string;
  nombre: string;
  descripcion?: string;
  costoPuntos: number;
  stock: number;
  activa: boolean;
  imagenUrl?: string;
  icono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecompensaService {
  private readonly API_URL = `${environment.apiUrl}/Recompensa`;

  constructor(private http: HttpClient) {}

  obtenerRecompensas(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }

  canjearRecompensa(recompensaId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/canjear`, { recompensaId });
  }

  obtenerTodasAdmin(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/admin`);
  }

  crearRecompensa(datos: any): Observable<any> {
    return this.http.post<any>(this.API_URL, datos);
  }

  actualizarRecompensa(id: string, datos: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, datos);
  }

  cambiarEstatus(id: string, activa: boolean): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}/estatus`, { activa });
  }
}