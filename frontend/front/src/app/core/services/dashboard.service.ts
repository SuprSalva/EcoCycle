import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DashboardGrafica {
  dia: string;
  cantidad: number;
  porcentaje: number;
}

export interface StockMateriaPrima{

  nombre:string;
  stockActual:number;

}

export interface UltimaSesion{

  fecha:string;
  maquinaId:string;

}

export interface DashboardResumen{

  totalBotellas:number;
  totalPuntosEmitidos:number;
  totalUsuarios:number;
  totalCanjes:number;
  grafica:DashboardGrafica[];
  stockMateriaPrima:StockMateriaPrima[];
  ultimasSesiones:UltimaSesion[];

}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getResumen(): Observable<DashboardResumen> {
    return this.http.get<any>(`${this.apiUrl}/resumen`).pipe(
      map(response => response.data)
    );
  }
}
