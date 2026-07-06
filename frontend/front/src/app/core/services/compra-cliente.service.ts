// 📁 src/app/core/services/compra-cliente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface CompraProducto {
  id: string;
  usuarioId: string;
  nombreProducto: string;
  descripcion?: string;
  fechaCompra: Date;
  precioTotal: number;
  manualUrl?: string;
  opinion?: string;
  calificacion?: number;
  cantidad?: number;
  precioUnitario?: number;
  total?: number;
  estado?: string;
}

export interface RegistrarCompraRequest {
  productoId?: string;
  nombreProducto: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  manualUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompraClienteService {
  private apiUrl = `${environment.apiUrl}/CompraProducto`;

  constructor(private http: HttpClient) {}


  obtenerMisCompras(): Observable<ApiResponse<CompraProducto[]>> {
    return this.http.get<ApiResponse<CompraProducto[]>>(`${this.apiUrl}/mis-compras`);
  }

  
  obtenerTodasLasCompras(): Observable<ApiResponse<CompraProducto[]>> {
    return this.http.get<ApiResponse<CompraProducto[]>>(`${this.apiUrl}/todas`);
  }

  registrarCompra(compra: RegistrarCompraRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, compra);
  }
actualizarEstado(compraId: string, estado: string): Observable<ApiResponse<any>> {
  console.log(`📤 Enviando PUT a: ${this.apiUrl}/${compraId}/estado`);
  // ✅ El body debe ser un objeto con la propiedad "estado"
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${compraId}/estado`, { estado });
}
  dejarOpinion(compraId: string, opinion: string, calificacion: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${compraId}/opinion`, {
      opinion,
      calificacion
    });
  }
}