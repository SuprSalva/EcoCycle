import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produccion, CrearProduccionRequest } from '../../models/produccion.model';

@Injectable({
  providedIn: 'root'
})
export class ProduccionService {

  private apiUrl = `${environment.apiUrl}/Produccion`;

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Produccion[]> {
    return this.http.get<Produccion[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<Produccion> {
    return this.http.get<Produccion>(`${this.apiUrl}/${id}`);
  }

  crear(request: CrearProduccionRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }
}
