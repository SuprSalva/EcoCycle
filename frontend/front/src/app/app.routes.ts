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
import {MateriaPrimaComponent} from './features/materia-prima/materia-prima.component';
import {ComentariosComponent} from './features/comentarios/comentarios.component';
import {CotizacionesComponent} from './features/cotizaciones/cotizaciones.component';
import {AdminProductosComponent} from './features/admin-productos/admin-productos.component';
import {RecetasComponent} from './features/recetas/recetas.component';
import {HomeComponent} from './features/home/home.component';


export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'producto', component: ProductoComponent },
  { path: 'home', component: HomeComponent },

  { 
    path: 'cliente',
    component: PanelClienteComponent,  
    canActivate: [clienteGuard],
    children: [

      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/cliente-panel/cliente-panel.component').then(m => m.ClientePanelComponent),
        children: [
          { path: 'perfil', loadComponent: () => import('./features/perfil-cliente/perfil-cliente.component').then(m => m.PerfilClienteComponent) },
          { path: 'mis-compras', loadComponent: () => import('./features/cliente-panel/mis-compras/mis-compras.component').then(m => m.MisComprasComponent) },
          { path: '', redirectTo: 'perfil', pathMatch: 'full' }
        ]
      },

      // 🌟 Catálogo Maestro
      { path: 'catalogo', component: CatalogoComponent },

      // RUTA HIJA: Notificaciones (/panel/notificaciones)
      { path: 'notificaciones', loadComponent: () => import('./features/notificaciones/notificaciones.component').then(c => c.NotificacionesComponent) },

      // RUTA HIJA: Historial de Recompensas (/panel/historial-recompensas)
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },

      { path: 'dashboard', component: DashboardClienteComponent },
      { path: 'mis-compras', component: ComprasClienteComponent },
      { path: 'soporte', component: SoporteComponent },
      { path: 'configuracion', loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },


  { 
    path: 'admin', 
    component: PanelComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'dashboard', component: DashboardGlobalComponent },

      {
        path: 'mi-perfil',
        loadComponent: () => import('./features/cliente-panel/cliente-panel.component').then(m => m.ClientePanelComponent),
        children: [
          { path: 'perfil', loadComponent: () => import('./features/perfil-cliente/perfil-cliente.component').then(m => m.PerfilClienteComponent) },
          { path: 'mis-compras', loadComponent: () => import('./features/cliente-panel/mis-compras/mis-compras.component').then(m => m.MisComprasComponent) },
          { path: '', redirectTo: 'perfil', pathMatch: 'full' }
        ]
      },

        {path: 'materia-prima', component: MateriaPrimaComponent},
      { path: 'dashboard', component: DashboardGlobalComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'reciclaje', component: SesionReciclajeComponent },
      { path: 'catalogo', component: CatalogoComponent },
      { path: 'historial-recompensas', component: HistorialRecompensasComponent },
      { path: 'quejas', component: ReportesComponent },
      { path: 'reportes-sistema', loadComponent: () => import('./features/reportes-sistema/reportes.component').then(m => m.ReportesComponent) },
      { path: 'soporte', component: SoporteComponent },
      { path: 'compras', component: AdminComprasComponent },
      { path: 'comentarios', component: ComentariosComponent },
      { path: 'cotizaciones', component: CotizacionesComponent },
      {
        path: 'admin-productos',
        loadComponent: () => import('./features/admin-productos/admin-productos.component')
          .then(c => c.AdminProductosComponent)
      },
      {
        path: 'admin-productos-form',
        loadComponent: () => import('./features/admin-productos/admin-productos-form/admin-productos-form.component')
          .then(c => c.ProductoCompletaComponent)
      },
      {
        path: 'admin-productos-form/:id',
        loadComponent: () => import('./features/admin-productos/admin-productos-form/admin-productos-form.component')
          .then(c => c.ProductoCompletaComponent)
      },
      {
        path: 'recetas',
        loadComponent: () => import('./features/recetas/recetas.component')
          .then(c => c.RecetasComponent)
      },
      {
        path: 'produccion',
        loadComponent: () => import('./features/produccion/produccion.component')
          .then(c => c.ProduccionComponent)
      },
      {
        path: 'recetas/nueva',
        loadComponent: () => import('./features/recetas/recetas-form/recetas-form.component')
          .then(c => c.RecetasFormComponent)
      },
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
      { path: 'configuracion', loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: 'error/:code', component: ErrorPageComponent },
  { path: 'error', component: ErrorPageComponent },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'error/404' }
];