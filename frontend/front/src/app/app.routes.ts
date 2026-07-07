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
import { NosotrosComponent } from './features/nosotros/nosotros.component';
import { ContactoComponent } from './features/contacto/contacto.component';
import { ProductoComponent } from './features/producto/producto.component';
import { ComprasClienteComponent } from './features/compras-cliente/compras-cliente.component';
import { AdminComprasComponent } from './features/admin-compras/admin-compras.component';
import { PerfilClienteComponent } from './features/perfil-cliente/perfil-cliente.component';
import {MateriaPrimaComponent} from './features/materia-prima/materia-prima.component'

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'producto', component: ProductoComponent },
  { path: 'maquina', loadComponent: () => import('./features/maquina-info/maquina-info.component').then(m => m.MaquinaInfoComponent) },
  { path: 'catalogo', component: CatalogoComponent },
  { 
    path: 'cliente',
    component: PanelClienteComponent,  
    canActivate: [clienteGuard],
    children: [


      {
        path: 'materia-prima',
        loadComponent: () => import('./features/materia-prima/materia-prima.component').then(m => m.MateriaPrimaComponent)
      },

      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/cliente-panel/cliente-panel.component').then(m => m.ClientePanelComponent),
        children: [
          { path: 'perfil', loadComponent: () => import('./features/cliente-panel/perfil-cliente/perfil-cliente.component').then(m => m.PerfilClienteComponent) },
          { path: 'mis-compras', loadComponent: () => import('./features/cliente-panel/mis-compras/mis-compras.component').then(m => m.MisComprasComponent) },
          { path: '', redirectTo: 'perfil', pathMatch: 'full' }
        ]
      },

      { path: 'usuarios', component: UsuariosComponent },

      // RUTA HIJA: Terminal Ingesta IoT (/panel/reciclaje)
      { path: 'reciclaje', component: SesionReciclajeComponent },

      // 🌟 RUTA HIJA NUEVA: Catálogo Maestro (/panel/catalogo)
      { path: 'catalogo', component: CatalogoComponent },

      // RUTA HIJA: Notificaciones (/panel/notificaciones)
      { path: 'notificaciones', loadComponent: () => import('./features/notificaciones/notificaciones.component').then(c => c.NotificacionesComponent) },

      // RUTA HIJA: Historial de Recompensas (/panel/historial-recompensas)
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },

      // RUTA HIJA: Reportes Núcleo (/panel/reportes)
      { path: 'reportes', component: ReportesComponent },
      { path: 'dashboard', component: DashboardClienteComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'perfil', component: PerfilClienteComponent },
      { path: 'mis-compras', component: ComprasClienteComponent },
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },


  { 
    path: 'admin', 
    component: PanelComponent,
    canActivate: [adminGuard],
    children: [
      // Dashboard
      { path: 'dashboard', component: DashboardGlobalComponent },

      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/cliente-panel/cliente-panel.component').then(m => m.ClientePanelComponent),
        children: [
          { path: 'perfil', loadComponent: () => import('./features/cliente-panel/perfil-cliente/perfil-cliente.component').then(m => m.PerfilClienteComponent) },
          { path: 'mis-compras', loadComponent: () => import('./features/cliente-panel/mis-compras/mis-compras.component').then(m => m.MisComprasComponent) },
          { path: '', redirectTo: 'perfil', pathMatch: 'full' }
        ]
      },

        {path: 'materia-prima', component: MateriaPrimaComponent},

      { path: 'dashboard', component: DashboardGlobalComponent },

      { path: 'usuarios', component: UsuariosComponent },
      { path: 'reciclaje', component: SesionReciclajeComponent },

      { path: 'catalogo', component: CatalogoComponent },

      // Historial de Recompensas
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },

      // Reportes
      { path: 'reportes', component: ReportesComponent },

      // Soporte
      { path: 'soporte', component: SoporteComponent },
      
       { path: 'compras', component: AdminComprasComponent },
      
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