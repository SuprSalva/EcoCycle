import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, getIdToken } from '@angular/fire/auth';
import { from, Observable, switchMap, tap, map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base de las URLs de tu backend de C#
  private authUrl = 'http://localhost:5000/api/Auth'; 
  private usuarioUrl = 'http://localhost:5000/api/Usuario';

  constructor(private auth: Auth, private http: HttpClient, private injector: Injector) {}

  // 1. INICIAR SESIÓN (Corregido para mantener contexto de inyección)
  login(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        // Ejecutamos getIdToken dentro del contexto de inyección de Angular
        return runInInjectionContext(this.injector, () => 
          from(getIdToken(userCredential.user)).pipe(
            tap((token) => {
              localStorage.setItem('token', token);
            })
          )
        );
      })
    );
  }

  // CERRAR SESIÓN
  logout(): Observable<void> {
    return from(this.auth.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('token');
      })
    );
  }

  // OBTENER PERFIL DE USUARIO LOGUEADO
  obtenerPerfilUsuario(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.usuarioUrl}/perfil`, { headers }).pipe(
      map(res => res.data)
    );
  }

  // 2. REGISTRO AUTÓNOMO (Corregido para mantener contexto de inyección)
  registro(email: string, password: string, datosAdicionales: any): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        return runInInjectionContext(this.injector, () => 
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
        );
      })
    );
  }

  // 3. REGISTRO DESDE EL ADMIN (Crea la cuenta en Firebase Auth e impacta tu base de datos)
  registrarDesdeAdmin(usuarioNuevo: any): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, usuarioNuevo.email, usuarioNuevo.password)).pipe(
      switchMap((userCredential) => {
        return from(getIdToken(userCredential.user)).pipe(
          switchMap((nuevoToken) => {
            // Usamos el token del administrador actual para autorizar la petición en C#
            const tokenAdmin = localStorage.getItem('token');
            const headers = new HttpHeaders().set('Authorization', `Bearer ${tokenAdmin}`);
            
            const body = {
              nombre: usuarioNuevo.nombre,
              apellidos: usuarioNuevo.apellidos || '',
              telefono: usuarioNuevo.telefono || '',
              direccion: usuarioNuevo.direccion || '',
              rol: usuarioNuevo.rol || 'usuario'
            };

            // Enviamos el registro al backend usando la sesión del Admin
            return this.http.post(`${this.authUrl}/registro`, body, { headers });
          })
        );
      })
    );
  }

  // 4. LEER: OBTENER TODOS LOS USUARIOS (Mantiene tu lógica funcional)
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

  // OBTENER UN SOLO USUARIO POR ID
  obtenerUsuarioPorId(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${this.usuarioUrl}/${id}`, { headers }).pipe(
      map(res => res.data)
    );
  }

  // 5. ACTUALIZAR: CAMBIAR DATOS, ROLES O ESTATUS DESDE EL ADMIN
  actualizarUsuario(id: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Mandamos el objeto modificado a C#
    return this.http.put(`${this.usuarioUrl}/${id}/estatus`, datos, { headers });
  }

  // 6. ELIMINAR: BORRAR CUENTA PERMANENTEMENTE
  eliminarUsuario(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.delete(`${this.usuarioUrl}/${id}`, { headers });
  }
}