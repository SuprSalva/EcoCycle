import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  getIdToken, 
  onIdTokenChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from '@angular/fire/auth';
import { from, Observable, switchMap, tap, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/Auth`;
  private usuarioUrl = `${environment.apiUrl}/Usuario`;

  constructor(
    private auth: Auth,
    private http: HttpClient,
    private injector: Injector
  ) {
    onIdTokenChanged(this.auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<any> {
  return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
    switchMap((userCredential) => {
      return runInInjectionContext(this.injector, () =>
        from(getIdToken(userCredential.user)).pipe(
          tap((token) => {
            localStorage.setItem('token', token);
          }),
          switchMap((token) => {
            return this.http.post<any>(`${this.authUrl}/login`, { email, password });
          }),
          tap((response) => {
            if (response.suceso && response.data) {
              localStorage.setItem('userData', JSON.stringify(response.data));
              console.log('userData guardado:', response.data);
            } else {
              console.log('No se pudo guardar userData:', response);
            }
            })
          )
        );
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
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
                direccion: datosAdicionales.direccion || '',
                rol: datosAdicionales.rol || 'cliente',
                contrasena: password
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
              rol: usuarioNuevo.rol || 'cliente'
            };

            return this.http.post(`${this.authUrl}/registro`, body, {
              headers: { Authorization: `Bearer ${nuevoToken}` }
            });
          })
        );
      })
    );
  }

  logout(): Observable<void> {
    return from(this.auth.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      })
    );
  }


  obtenerPerfilUsuario(): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/perfil`).pipe(
      map(res => res.data)
    );
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/${id}`).pipe(
      map(res => res.data)
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

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.usuarioUrl}/${id}`, datos);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.usuarioUrl}/${id}`);
  }
  
  getRolUsuario(): string | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const data = JSON.parse(userData);
      return data.rol?.toLowerCase() || null;
    }
    return null;
  }

  esAdministrador(): boolean {
    const rol = this.getRolUsuario();
    return rol === 'admin' || rol === 'administrador';
  }

  esCliente(): boolean {
    const rol = this.getRolUsuario();
    return rol === 'cliente' || rol === 'usuario';
  }

  obtenerUsuarioActual(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

 
  cambiarPassword(passwordActual: string, nuevaPassword: string): Observable<any> {
    return of(this.auth.currentUser).pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }
        
        if (!user.email) {
          throw new Error('El usuario no tiene email');
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          passwordActual
        );

        return from(reauthenticateWithCredential(user, credential)).pipe(
          switchMap(() => {
            return from(updatePassword(user, nuevaPassword));
          })
        );
      })
    );
  }
}