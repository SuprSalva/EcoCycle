import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SesionReciclaje {
  id?: string;
  usuarioId: string;
  maquinaId: string;
  botellas: number;
  puntos: number;
  fecha?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionReciclajeService {
  private readonly apiUrl = `${environment.apiUrl}/SesionReciclaje`;

  constructor(private http: HttpClient) {}

  /**
   * Registra una nueva sesión de reciclaje simulando el nodo IoT.
   * @param payload Datos de la sesión (usuarioId, maquinaId, botellas)
   */
  registrarSesion(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  /**
   * Obtiene todas las sesiones de reciclaje registradas en el sistema.
   */
  obtenerTodasLasSesiones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/todas`);
  }
}
