// 📁 src/app/core/services/soporte.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ComentarioItem {
  id?: string;
  email?: string;
  asunto: string;
  mensaje: string;
  categoria?: string;
  estatus?: string;
  fecha?: any;
  usuarioId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SoporteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ CREAR COMENTARIO
  crearComentario(comentario: ComentarioItem): Observable<any> {
    if (!comentario.asunto || !comentario.mensaje) {
      throw new Error('Asunto y mensaje son obligatorios');
    }

    const payload = {
      asunto: comentario.asunto.trim(),
      mensaje: comentario.mensaje.trim(),
      categoria: comentario.categoria || 'Sugerencia'
    };

    return this.http.post(`${this.apiUrl}/Comentario/crear`, payload);
  }

  // ✅ OBTENER TODOS (SOLO ADMIN)
  obtenerTodosLosComentarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Comentario/todos`);
  }

  // ✅ OBTENER MIS COMENTARIOS (CLIENTE)
  obtenerMisComentarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Comentario/mis-comentarios`);
  }

  // ✅ ACTUALIZAR COMENTARIO (SOLO ADMIN)
  actualizarComentario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Comentario/${id}`, datos);
  }

  // ✅ ELIMINAR COMENTARIO (SOLO ADMIN)
  eliminarComentario(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Comentario/${id}`);
  }

  // ✅ RESPONDER COMENTARIO (SOLO ADMIN)
  responderComentario(id: string, respuesta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comentario/${id}/responder`, { respuesta });
  }
}