import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 🔓 EXCEPCIÓN DE SEGURIDAD: Si intentas ir al catálogo, ignora a Firebase y déjame pasar
  if (state.url.includes('catalogo')) {
    return true;
  }

  // Aquí abajo sigue tu código original de Firebase...
  // Por ejemplo, si tienes algo como:
  const token = localStorage.getItem('token'); 
  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};