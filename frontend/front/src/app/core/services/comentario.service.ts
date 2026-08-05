import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Comentario} from '../../models/comentario.model';

@Injectable({
  providedIn: 'root'
})
export class ComentariosService {

  private apiUrl = `${environment.apiUrl}/Comentarios`;

  constructor(private http: HttpClient) { }

  obtenerTodos(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(this.apiUrl);
  }

  obtenerPublicos(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/publicos`);
  }

  obtenerPorId(id: string): Observable<Comentario> {
    return this.http.get<Comentario>(`${this.apiUrl}/${id}`);
  }

  crear(comentario: Comentario): Observable<any> {
    return this.http.post<any>(this.apiUrl, comentario);
  }

  actualizar(id: string, comentario: Comentario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, comentario);
  }

  cambiarVisibilidad(id: string, esPublico: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/visibilidad`, esPublico, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  public enviarResolucion(id: string, nombreCliente: string, mensajeOriginal: string, respuestaAdmin: string): Observable<any> {
    const body = {
      nombreCliente: nombreCliente || 'Usuario Anónimo',
      mensajeOriginal: mensajeOriginal,
      respuestaAdmin: respuestaAdmin
    };
    return this.http.put<any>(`${this.apiUrl}/${id}/responder`, body);
  }
}