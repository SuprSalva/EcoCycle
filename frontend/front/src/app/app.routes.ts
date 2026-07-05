// app.routes.ts - CORREGIDO
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
import { DashboardClienteComponent } from './features/dashboard-cliente/dashboard-cliente.component';
import { authGuard, adminGuard, clienteGuard } from './core/guards/auth.guard';
import { ReportesComponent } from './features/reportes/reportes.component';
import { HistorialRecompensasComponent } from './features/historial-recompensas/historial-recompensas.component';
import { ErrorPageComponent } from './features/error-page/error-page.component';
import { ComprasClienteComponent } from './features/compras-cliente/compras-cliente.component';
import { AdminComprasComponent } from './features/admin-compras/admin-compras.component';
import { PerfilClienteComponent } from './features/perfil-cliente/perfil-cliente.component';
export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'catalogo', component: CatalogoComponent },

  // ============================================
  // RUTAS DEL CLIENTE
  // ============================================
  { 
    path: 'cliente',
    component: PanelClienteComponent,  
    canActivate: [clienteGuard],
    children: [
      { path: 'dashboard', component: DashboardClienteComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'perfil', component: PerfilClienteComponent },
      { path: 'mis-compras', component: ComprasClienteComponent },
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ============================================
  // RUTAS DEL ADMINISTRADOR
  // ============================================
  { 
    path: 'admin', 
    component: PanelComponent,
    canActivate: [adminGuard],
    children: [
      // Dashboard
      { path: 'dashboard', component: DashboardGlobalComponent },

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
      
      // ✅ CORREGIDO: La ruta es 'compras' (no 'admin/compras')
      { path: 'compras', component: AdminComprasComponent },
      
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
  // RUTAS DE ERROR
  // ============================================
  { path: 'error/:code', component: ErrorPageComponent },
  { path: 'error', component: ErrorPageComponent },

  // ============================================
  // REDIRECCIONES
  // ============================================
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' }
];