import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecetaDetalle } from '../../models/receta-detalle.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecetasDetalleService {
  private apiUrl = `${environment.apiUrl}/recetasdetalle`;

  constructor(private http: HttpClient) {}

  // Obtener los detalles/insumos de una receta en específico
  obtenerPorReceta(recetaId: string): Observable<RecetaDetalle[]> {
    return this.http.get<RecetaDetalle[]>(`${this.apiUrl}/receta/${recetaId}`);
  }

  // Agregar un nuevo insumo a la receta
  crear(detalle: RecetaDetalle): Observable<any> {
    return this.http.post<any>(this.apiUrl, detalle);
  }

  // Actualizar un insumo existente
  actualizar(id: string, detalle: RecetaDetalle): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, detalle);
  }

  // Eliminar un insumo de la receta
  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}