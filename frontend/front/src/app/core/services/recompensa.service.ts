import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recompensa {
  id: string;
  nombre: string;
  costoPuntos: number;
  stock: number;
  activa: boolean;
  icono?: string;
}

@Injectable({
  providedIn: 'root'
})
// 🌟 CORREGIDO: Debe ser obligatoriamente 'export class' para que Angular lo reconozca como un token inyectable válido
export class RecompensaService {
  private API_URL = 'http://localhost:5171/api/recompensa';

  constructor(private http: HttpClient) {}

  obtenerRecompensas(): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<any>(this.API_URL, { headers });
  }

  crearRecompensa(nuevaRecompensa: any): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const cuerpoPeticion = {
      Nombre: nuevaRecompensa.nombre,
      Descripcion: nuevaRecompensa.descripcion || 'Sin descripción', 
      CostoPuntos: Number(nuevaRecompensa.costoPuntos), 
      Stock: Math.floor(Number(nuevaRecompensa.stock)),  
      Activa: nuevaRecompensa.activa !== undefined ? nuevaRecompensa.activa : true 
    };

    return this.http.post<any>(`${this.API_URL}/crear`, cuerpoPeticion, { headers });
  }

  canjearRecompensa(recompensaId: string): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('idToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<any>(`${this.API_URL}/canjear`, { recompensaId }, { headers });
  }
}