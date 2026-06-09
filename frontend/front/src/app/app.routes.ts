import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegistroComponent } from './features/registro/registro.component';
import { PanelComponent } from './features/panel/panel.component'; 
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { SesionReciclajeComponent } from './features/sesion-reciclaje/sesion-reciclaje.component';
// 🌟 IMPORTAMOS EL COMPONENTE DEL CATÁLOGO MAESTRO
import { CatalogoComponent } from './features/catalogo/catalogo.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. Rutas Públicas (Cualquiera puede entrar)
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // 2. Ruta Padre del Panel (PROTEGIDA BAJO LLAVE)
  { 
    path: 'panel', 
    component: PanelComponent, 
    canActivate: [authGuard], // Protege el panel y automáticamente a todas sus rutas hijas
    children: [
      // RUTA HIJA: Control de Usuarios (/panel/usuarios)
      { path: 'usuarios', component: UsuariosComponent },

      // RUTA HIJA: Terminal Ingesta IoT (/panel/reciclaje)
      { path: 'reciclaje', component: SesionReciclajeComponent },

      // 🌟 RUTA HIJA NUEVA: Catálogo Maestro (/panel/catalogo)
      { path: 'catalogo', component: CatalogoComponent },

      // RUTA HIJA: Reportes Núcleo (/panel/reportes)
      { path: 'reportes', component: SesionReciclajeComponent },

      // Redirección por defecto al entrar a /panel (Te manda a usuarios)
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
    ]
  },
  
  // 3. Redirecciones de control del Sistema
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // 🌟 CAMBIA ESTA LÍNEA TEMPORALMENTE:
  { path: '**', redirectTo: 'panel/usuarios' } 

];