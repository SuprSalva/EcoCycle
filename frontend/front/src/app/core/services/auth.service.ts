import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, getIdToken, onIdTokenChanged, sendPasswordResetEmail } from '@angular/fire/auth';
import { from, Observable, switchMap, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/Auth`; 
  private usuarioUrl = `${environment.apiUrl}/Usuario`;

  constructor(private auth: Auth, private http: HttpClient, private injector: Injector) {
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

  login(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
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

  logout(): Observable<void> {
    return from(this.auth.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('token');
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  obtenerPerfilUsuario(): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/perfil`).pipe(
      map(res => res.data)
    );
  }

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

            return this.http.post(`${this.authUrl}/registro`, body, {
              headers: { Authorization: `Bearer ${nuevoToken}` }
            });
          })
        );
      })
    );
  }

  obtenerTodosLosUsuarios(): Observable<any[]> {
    return this.http.get<any>(`${this.usuarioUrl}/todos`).pipe(
      map(respuestaCsharp => {
        console.log('Datos crudos llegados de C#:', respuestaCsharp);
        return respuestaCsharp.data || []; 
      })
    );
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.usuarioUrl}/${id}`, datos);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.usuarioUrl}/${id}`);
  }
}
