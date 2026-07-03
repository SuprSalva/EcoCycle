import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegistroComponent } from './features/registro/registro.component';
import { PanelComponent } from './features/panel/panel.component'; 
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { SoporteComponent } from './features/soporte/soporte.component';
import { PanelClienteComponent } from './features/panel-cliente/panel-cliente.component';
import { SesionReciclajeComponent } from './features/sesion-reciclaje/sesion-reciclaje.component';
import { CatalogoComponent } from './features/catalogo/catalogo.component';
import { DashboardGlobalComponent } from './features/dashboard-global/dashboard-global.component';
// ✅ IMPORTAR DashboardClienteComponent
import { DashboardClienteComponent } from './features/dashboard-cliente/dashboard-cliente.component';
import { authGuard, adminGuard, clienteGuard } from './core/guards/auth.guard';
import { ReportesComponent } from './features/reportes/reportes.component';
import { HistorialRecompensasComponent } from './features/historial-recompensas/historial-recompensas.component';
import { ErrorPageComponent } from './features/error-page/error-page.component';

export const routes: Routes = [
  // ============================================
  // 1. RUTAS PÚBLICAS (Sin autenticación)
  // ============================================
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'catalogo', component: CatalogoComponent }, // ✅ RUTA PÚBLICA FALTANTE

  // ============================================
  // 2. RUTAS DEL CLIENTE (Solo usuarios con rol "cliente")
  // ============================================
  { 
    path: 'cliente',
    component: PanelClienteComponent,  // ✅ LAYOUT CLIENTE
    canActivate: [clienteGuard],
    children: [
      { path: 'dashboard', component: DashboardClienteComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ============================================
  // 3. RUTAS DEL ADMINISTRADOR (Solo usuarios con rol "admin")
  // ============================================
  { 
    path: 'admin', 
    component: PanelComponent,
    canActivate: [adminGuard],
    children: [
      // Dashboard
      { path: 'dashboard', component: DashboardGlobalComponent }, // ✅ CORREGIDO

      // Gestión de Usuarios
      { path: 'usuarios', component: UsuariosComponent },

      // Gestión de Reciclaje
      { path: 'reciclaje', component: SesionReciclajeComponent },

      // Catálogo de Productos
      { path: 'catalogo', component: CatalogoComponent },

      // Historial de Recompensas
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },

      // Reportes
      { path: 'reportes', component: ReportesComponent },
      
      // Soporte
      { path: 'soporte', component: SoporteComponent },
      
      // Gestión de Proveedores
      { 
        path: 'proveedores', 
        loadComponent: () => import('./features/proveedores/proveedores-list/proveedores-list.component')
          .then(c => c.ProveedoresListComponent) 
      },
      { 
        path: 'proveedores/nuevo', 
        loadComponent: () => import('./features/proveedores/proveedores-form/proveedores-form.component')
          .then(c => c.ProveedoresFormComponent) 
      },
      { 
        path: 'proveedores/editar/:id', 
        loadComponent: () => import('./features/proveedores/proveedores-form/proveedores-form.component')
          .then(c => c.ProveedoresFormComponent) 
      },

      // Gestión de Compras a Proveedores
      { 
        path: 'compras-proveedores', 
        loadComponent: () => import('./features/compras-proveedores/compras-list/compras-list.component')
          .then(c => c.ComprasListComponent) 
      },
      { 
        path: 'compras-proveedores/nueva', 
        loadComponent: () => import('./features/compras-proveedores/compras-form/compras-form.component')
          .then(c => c.ComprasFormComponent) 
      },

      // Redirección por defecto dentro de /admin
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ============================================
  // 4. RUTAS DE ERROR
  // ============================================
  { path: 'error/:code', component: ErrorPageComponent },
  { path: 'error', component: ErrorPageComponent },

  // ============================================
  // 5. REDIRECCIONES POR DEFECTO
  // ============================================
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' }
];