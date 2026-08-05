import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Receta } from '../../models/receta.model';

@Injectable({
  providedIn: 'root'
})
export class RecetasService {

  private apiUrl = `${environment.apiUrl}/Recetas`;

  constructor(private http: HttpClient) { }

  crear(receta: Receta): Observable<any> {
    return this.http.post<any>(this.apiUrl, receta);
  }

  obtenerTodas(): Observable<Receta[]> {
    return this.http.get<Receta[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, receta: Receta): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, receta);
  }

  actualizarEstatus(id: string, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estatus`, { activo });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}