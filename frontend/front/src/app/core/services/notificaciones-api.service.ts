import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface NotificacionResponse {
  id: string;
  usuarioId: string;
  titulo: string;
  descripcion: string;
  icono: string;
  leida: boolean;
  fecha: string;
}

export interface ApiResponse<T> {
  suceso: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesApiService {
  private apiUrl = `${environment.apiUrl}/Notificacion`;

  constructor(private http: HttpClient) { }

  getMisNotificaciones(): Observable<ApiResponse<NotificacionResponse[]>> {
    return this.http.get<ApiResponse<NotificacionResponse[]>>(this.apiUrl);
  }

  marcarComoLeidas(): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/leer`, {});
  }
}
