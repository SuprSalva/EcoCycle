import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ComentarioItem {
  id?: string;
  usuarioId?: string;
  email?: string;
  asunto: string;
  mensaje: string;
  categoria: string;
  estatus?: string;
  fecha?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SoporteService {
  private readonly apiUrl = `${environment.apiUrl}/Comentario`;

  constructor(private http: HttpClient) {}

  crearComentario(comentario: ComentarioItem): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, comentario);
  }

  obtenerMisComentarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mis-comentarios`);
  }

  obtenerTodosLosComentarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/todos`);
  }
}