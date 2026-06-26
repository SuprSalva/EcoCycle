import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MateriaPrima {
  id?: string;
  nombre: string;
  unidad: string;
  stockActual: number;
  costoPromedioUnitario: number;
  ultimaActualizacion?: Date;
  activo?: boolean;
}

export interface MateriaPrimaTransaccion {
  id?: string;
  materiaPrimaId?: string;
  tipo: string;
  cantidad: number;
  costoUnitario: number;
  fecha?: Date;
  usuarioId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {
  private apiUrl = `${environment.apiUrl}/MateriaPrima`;

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<MateriaPrima[]> {
    return this.http.get<any>(this.apiUrl).pipe(map(res => res.data));
  }

  obtenerPorId(id: string): Observable<MateriaPrima> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(res => res.data));
  }

  crear(materia: MateriaPrima): Observable<MateriaPrima> {
    return this.http.post<any>(this.apiUrl, materia).pipe(map(res => res.data));
  }

  actualizar(id: string, materia: MateriaPrima): Observable<MateriaPrima> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, materia).pipe(map(res => res.data));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  registrarTransaccion(id: string, transaccion: MateriaPrimaTransaccion): Observable<MateriaPrima> {
    return this.http.post<any>(`${this.apiUrl}/${id}/transaccion`, transaccion).pipe(map(res => res.data));
  }

  obtenerTransacciones(id: string): Observable<MateriaPrimaTransaccion[]> {
    return this.http.get<any>(`${this.apiUrl}/${id}/transacciones`).pipe(map(res => res.data));
  }
}
