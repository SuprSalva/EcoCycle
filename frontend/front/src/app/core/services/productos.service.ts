import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, CrearProductoCompletoRequest, ProductoCompletoResponse } from '../../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private apiUrl = `${environment.apiUrl}/Productos`;

  constructor(private http: HttpClient) { }

  crear(producto: Producto): Observable<any> {
    return this.http.post<any>(this.apiUrl, producto);
  }

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: string, producto: Producto) {
    return this.http.put(`${this.apiUrl}/${id}`, {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      activo: producto.activo
    }
    );

  }

  actualizarEstatus(id: string, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estatus`, { id, activo });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  actualizarProductoCompleto(
    id: string,
    data: CrearProductoCompletoRequest
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/completo/${id}`,
      data
    );

  }

  obtenerProductoCompleto(id: string): Observable<ProductoCompletoResponse> {

    return this.http.get<ProductoCompletoResponse>(
      `${this.apiUrl}/completo/${id}`
    );

  }

  crearProductoCompleto(data: CrearProductoCompletoRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/completo`, data);
  }
}