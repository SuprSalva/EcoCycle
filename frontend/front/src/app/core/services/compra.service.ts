import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/CompraProducto`;

  constructor(private http: HttpClient) { }

  obtenerMisCompras(): Observable<CompraProducto[]> {
    return this.http.get<any>(`${this.apiUrl}/mis-compras`).pipe(map(res => res.data));
  }

  dejarOpinion(id: string, opinion: string, calificacion: number): Observable<CompraProducto> {
    return this.http.put<any>(`${this.apiUrl}/${id}/opinion`, { opinion, calificacion }).pipe(map(res => res.data));
  }
}
