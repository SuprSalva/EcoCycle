import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegistroComponent } from './features/registro/registro.component';
import { PanelComponent } from './features/panel/panel.component'; 
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { SesionReciclajeComponent } from './features/sesion-reciclaje/sesion-reciclaje.component';
// 🌟 IMPORTAMOS EL COMPONENTE DEL CATÁLOGO MAESTRO
import { CatalogoComponent } from './features/catalogo/catalogo.component';
import { DashboardGlobalComponent } from './features/dashboard-global/dashboard-global.component';
import { authGuard } from './core/guards/auth.guard';
import { ReportesComponent } from './features/reportes/reportes.component';
import { HistorialRecompensasComponent } from './features/historial-recompensas/historial-recompensas.component';
import { ErrorPageComponent } from './features/error-page/error-page.component';

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
      // RUTA HIJA: Dashboard Global (/panel/dashboard)
      { path: 'dashboard', component: DashboardGlobalComponent },

      // RUTA HIJA: Control de Usuarios (/panel/usuarios)
      { path: 'usuarios', component: UsuariosComponent },

      // RUTA HIJA: Terminal Ingesta IoT (/panel/reciclaje)
      { path: 'reciclaje', component: SesionReciclajeComponent },

      // 🌟 RUTA HIJA NUEVA: Catálogo Maestro (/panel/catalogo)
      { path: 'catalogo', component: CatalogoComponent },

      // RUTA HIJA: Historial de Recompensas (/panel/historial-recompensas)
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },

      // RUTA HIJA: Reportes Núcleo (/panel/reportes)
      { path: 'reportes', component: ReportesComponent },

      // RUTA HIJA NUEVA: Materia Prima (/panel/materia-prima)
      { 
        path: 'materia-prima', 
        loadComponent: () => import('./features/materia-prima/materia-prima.component').then(m => m.MateriaPrimaComponent) 
      },

      // RUTA HIJA NUEVA: Panel del Cliente (/panel/cliente)
      { 
        path: 'cliente', 
        loadComponent: () => import('./features/cliente-panel/cliente-panel.component').then(m => m.ClientePanelComponent),
        children: [
          { path: 'perfil', loadComponent: () => import('./features/cliente-panel/perfil-cliente/perfil-cliente.component').then(m => m.PerfilClienteComponent) },
          { path: 'mis-compras', loadComponent: () => import('./features/cliente-panel/mis-compras/mis-compras.component').then(m => m.MisComprasComponent) },
          { path: '', redirectTo: 'perfil', pathMatch: 'full' }
        ]
      },

      // Redirección por defecto al entrar a /panel (Te manda a dashboard)
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // 3. Rutas de Error
  { path: 'error/:code', component: ErrorPageComponent },
  { path: 'error', component: ErrorPageComponent },

  // 4. Redirecciones de control del Sistema
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' } 
];