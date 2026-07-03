import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔍 adminGuard ejecutado');
  
  const token = authService.getToken();
  console.log('🔍 Token:', token ? '✅ SÍ' : '❌ NO');
  
  if (!token) {
    console.log('❌ No hay token, redirigiendo a login');
    router.navigate(['/login']);
    return false;
  }

  const rol = authService.getRolUsuario();
  console.log('🔍 Rol:', rol);

  if (rol === 'admin' || rol === 'administrador') {
    console.log('✅ Es administrador, acceso permitido');
    return true;
  }

  console.log('❌ No es administrador, redirigiendo a login');
  router.navigate(['/login']);
  return false;
};

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const rol = authService.getRolUsuario();

  if (rol === 'cliente' || rol === 'usuario') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  
  if (token) {
    return true;
  }

  if (state.url.includes('catalogo')) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};