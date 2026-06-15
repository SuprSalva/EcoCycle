import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🌟 CORREGIDO: Usamos export en lugar de public
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
// 🌟 CORREGIDO: Usamos export class en lugar de public class
export class RecompensaService {
  private readonly API_URL = 'http://localhost:5000/api/Recompensa';

  constructor(private http: HttpClient) {}

  obtenerRecompensas(): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
    
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(this.API_URL, { headers });
  }

  canjearRecompensa(recompensaId: string): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
    
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<any>(`${this.API_URL}/canjear`, { recompensaId }, { headers });
  }

  obtenerTodasAdmin(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.API_URL}/admin`, { headers });
  }

  crearRecompensa(datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.API_URL, datos, { headers });
  }

  actualizarRecompensa(id: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.API_URL}/${id}`, datos, { headers });
  }

  cambiarEstatus(id: string, activa: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.API_URL}/${id}/estatus`, { activa }, { headers });
  }
}