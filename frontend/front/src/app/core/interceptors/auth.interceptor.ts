import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  let authReq = req;
  
  // No agregar token para el endpoint de login
  if (!req.url.includes('/Auth/login') && !req.headers.has('Authorization') && token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.navigate(['/login']);
      } else if (err.status === 403) {
        router.navigate(['/error/403']);
      } else if (err.status >= 500) {
        router.navigate(['/error/500']);
      }
      return throwError(() => err);
    })
  );
};