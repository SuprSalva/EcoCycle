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

  // ============================================
  // MÉTODOS DE AUTENTICACIÓN
  // ============================================

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ 1. INICIAR SESIÓN
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
            // ✅ CORREGIDO: Usar 'suceso' en lugar de 'success'
            if (response.suceso && response.data) {
              localStorage.setItem('userData', JSON.stringify(response.data));
              console.log('✅ userData guardado:', response.data);
            } else {
              console.log('❌ No se pudo guardar userData:', response);
            }
            })
          )
        );
      })
    );
  }

  // ✅ 2. REGISTRO (NUEVO USUARIO DESDE FRONTEND)
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
                rol: 'cliente' // Por defecto cliente
              };

              return this.http.post(`${this.authUrl}/registro`, body);
            })
          )
        );
      })
    );
  }

  // ✅ 3. REGISTRO DESDE ADMIN (CREA USUARIO CON ROL ESPECÍFICO)
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

  // ✅ 4. CERRAR SESIÓN
  logout(): Observable<void> {
    return from(this.auth.signOut()).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      })
    );
  }

  // ============================================
  // MÉTODOS PARA OBTENER DATOS DEL USUARIO
  // ============================================

  // ✅ 5. OBTENER PERFIL DEL USUARIO LOGUEADO
  obtenerPerfilUsuario(): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/perfil`).pipe(
      map(res => res.data)
    );
  }

  // ✅ 6. OBTENER USUARIO POR ID (NUEVO - PARA ADMIN)
  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.usuarioUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  // ✅ 7. OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
  obtenerTodosLosUsuarios(): Observable<any[]> {
    return this.http.get<any>(`${this.usuarioUrl}/todos`).pipe(
      map(respuestaCsharp => {
        console.log('Datos crudos llegados de C#:', respuestaCsharp);
        return respuestaCsharp.data || [];
      })
    );
  }

  // ✅ 8. ACTUALIZAR USUARIO (SOLO ADMIN)
  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.usuarioUrl}/${id}`, datos);
  }

  // ✅ 9. ELIMINAR USUARIO (SOLO ADMIN)
  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete(`${this.usuarioUrl}/${id}`);
  }

  // ============================================
  // MÉTODOS PARA VERIFICAR ROL
  // ============================================

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
}