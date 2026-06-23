import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, getIdToken } from '@angular/fire/auth';
import { from, Observable, switchMap, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:5171/api/Auth'; 
  private usuarioUrl = 'http://localhost:5171/api/Usuario';

  constructor(private auth: Auth, private http: HttpClient) {}

  // 1. INICIAR SESIÓN (Limpio, seguro y sin romper el contexto)
  login(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => from(getIdToken(userCredential.user))),
      tap((token) => {
        localStorage.setItem('token', token);
      })
    );
  }

  // 2. REGISTRO AUTÓNOMO
  registro(email: string, password: string, datosAdicionales: any): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => 
        from(getIdToken(userCredential.user)).pipe(
          switchMap((token) => {
            localStorage.setItem('token', token);

            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            
            const body = {
              nombre: datosAdicionales.nombre,
              apellidos: datosAdicionales.apellidos || '',
              telefono: datosAdicionales.telefono || '',
              direccion: datosAdicionales.direccion || ''
            };

            return this.http.post(`${this.authUrl}/registro`, body, { headers });
          })
        )
      )
    );
  }

  // 3. REGISTRO DESDE EL ADMIN
  registrarDesdeAdmin(usuarioNuevo: any): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, usuarioNuevo.email, usuarioNuevo.password)).pipe(
      switchMap((userCredential) => {
        const tokenAdmin = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${tokenAdmin}`);
        
        const body = {
          nombre: usuarioNuevo.nombre,
          apellidos: usuarioNuevo.apellidos || '',
          telefono: usuarioNuevo.telefono || '',
          direccion: usuarioNuevo.direccion || '',
          rol: usuarioNuevo.rol || 'usuario'
        };

        return this.http.post(`${this.authUrl}/registro`, body, { headers });
      })
    );
  }

  // 4. LEER: OBTENER TODOS LOS USUARIOS
  obtenerTodosLosUsuarios(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.usuarioUrl}/todos`, { headers }).pipe(
      map(respuestaCsharp => {
        console.log('Datos crudos llegados de C#:', respuestaCsharp);
        return respuestaCsharp.data || []; 
      })
    );
  }

  // 5. ACTUALIZAR USUARIO
  actualizarUsuario(id: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.usuarioUrl}/${id}`, datos, { headers });
  }

  // 6. ELIMINAR USUARIO
  eliminarUsuario(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.usuarioUrl}/${id}`, { headers });
  }
}