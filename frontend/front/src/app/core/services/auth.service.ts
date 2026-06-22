import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, getIdToken, onIdTokenChanged } from '@angular/fire/auth';
import { from, Observable, switchMap, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/Auth`; 
  private usuarioUrl = `${environment.apiUrl}/Usuario`;

  constructor(private auth: Auth, private http: HttpClient, private injector: Injector) {
    // BUG FIX: El token de Firebase expira a la hora. Con esto, Angular escucha silenciosamente
    // cada vez que Firebase refresca el token en el fondo y nosotros actualizamos localStorage.
    onIdTokenChanged(this.auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

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
    return this.http.get<any>(`${this.usuarioUrl}/perfil`).pipe(
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
              
              const body = {
                nombre: datosAdicionales.nombre,
                apellidos: datosAdicionales.apellidos || '',
                telefono: datosAdicionales.telefono || '',
                direccion: datosAdicionales.direccion || ''
              };

              return this.http.post(`${this.authUrl}/registro`, body);
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
            const body = {
              nombre: usuarioNuevo.nombre,
              apellidos: usuarioNuevo.apellidos || '',
              telefono: usuarioNuevo.telefono || '',
              direccion: usuarioNuevo.direccion || '',
              rol: usuarioNuevo.rol || 'usuario'
            };

            // Enviamos el registro al backend con el token RECIÉN CREADO (del nuevo usuario)
            // Esto evita que el interceptor mande el token del administrador y cause un 400 Bad Request
            return this.http.post(`${this.authUrl}/registro`, body, {
              headers: { Authorization: `Bearer ${nuevoToken}` }
            });
          })
        );
      })
    );
  }

  // 4. LEER: OBTENER TODOS LOS USUARIOS (Mantiene tu lógica funcional)
  obtenerTodosLosUsuarios(): Observable<any[]> {
    return this.http.get<any>(`${this.usuarioUrl}/todos`).pipe(
      map(respuestaCsharp => {
        console.log('Datos crudos llegados de C#:', respuestaCsharp);
        return respuestaCsharp.data || []; 
      })
    );
  }

  // OBTENER UN SOLO USUARIO POR ID
  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  // 5. ACTUALIZAR: CAMBIAR DATOS, ROLES O ESTATUS DESDE EL ADMIN
  actualizarUsuario(id: string, datos: any): Observable<any> {
    // Mandamos el objeto modificado a C#
    return this.http.put(`${this.usuarioUrl}/${id}`, datos);
  }

  // 6. ELIMINAR: BORRAR CUENTA PERMANENTEMENTE
  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.usuarioUrl}/${id}`);
  }
}