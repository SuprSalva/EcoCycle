import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proveedor, ProveedorCrear } from '../../models/proveedor.model';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private apiUrl = `${environment.apiUrl}/Proveedor`;

  constructor(private http: HttpClient) {}

  getProveedores(): Observable<ApiResponse<Proveedor[]>> {
    return this.http.get<ApiResponse<Proveedor[]>>(this.apiUrl);
  }

  getProveedor(id: string): Observable<ApiResponse<Proveedor>> {
    return this.http.get<ApiResponse<Proveedor>>(`${this.apiUrl}/${id}`);
  }

  crearProveedor(proveedor: ProveedorCrear): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, proveedor);
  }

  actualizarProveedor(id: string, proveedor: ProveedorCrear): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}`, proveedor);
  }

  eliminarProveedor(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
