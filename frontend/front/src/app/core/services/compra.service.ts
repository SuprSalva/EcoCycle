import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  CompraProveedor,
  CompraProveedorCrear
} from '../../models/compra-proveedor.model';

import { ApiResponse } from '../../models/api-response.model';

export interface CompraProducto {
  id?: string;
  usuarioId?: string;
  nombreProducto: string;
  descripcion: string;
  fechaCompra?: Date;
  precioTotal: number;
  manualUrl?: string;
  opinion?: string;
  calificacion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private apiProveedorUrl = `${environment.apiUrl}/compras-proveedores`;
  private apiProductoUrl = `${environment.apiUrl}/CompraProducto`;

  constructor(private http: HttpClient) {}

  getCompras(): Observable<ApiResponse<CompraProveedor[]>> {
    return this.http.get<ApiResponse<CompraProveedor[]>>(this.apiProveedorUrl);
  }

  registrarCompra(compra: CompraProveedorCrear): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiProveedorUrl, compra);
  }

  obtenerMisCompras(): Observable<CompraProducto[]> {
    return this.http
      .get<any>(`${this.apiProductoUrl}/mis-compras`)
      .pipe(map(res => res.data));
  }

  dejarOpinion(
    id: string,
    opinion: string,
    calificacion: number
  ): Observable<CompraProducto> {
    return this.http
      .put<any>(`${this.apiProductoUrl}/${id}/opinion`, {
        opinion,
        calificacion
      })
      .pipe(map(res => res.data));
  }
}