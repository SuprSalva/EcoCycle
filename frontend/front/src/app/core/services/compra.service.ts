import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompraProveedor, CompraProveedorCrear } from '../../models/compra-proveedor.model';
import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiUrl}/compras-proveedores`;

  constructor(private http: HttpClient) {}

  getCompras(): Observable<ApiResponse<CompraProveedor[]>> {
    return this.http.get<ApiResponse<CompraProveedor[]>>(this.apiUrl);
  }

  registrarCompra(compra: CompraProveedorCrear): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, compra);
  }
}
