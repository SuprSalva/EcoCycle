import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegistroComponent } from './features/registro/registro.component';
import { PanelComponent } from './features/panel/panel.component'; 
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { SesionReciclajeComponent } from './features/sesion-reciclaje/sesion-reciclaje.component';
import { CatalogoComponent } from './features/catalogo/catalogo.component';
import { DashboardBotellasComponent } from './features/dashboard-botellas/dashboard-botellas.component';
import { ReportesNucleoComponent } from './features/reportes-nucleo/reportes-nucleo.component'; // 👈 1. IMPORTANTE: Importamos tu nuevo componente
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  { 
    path: 'panel', 
    component: PanelComponent, 
    canActivate: [authGuard], 
    children: [
      // Dashboard Global
      { path: 'dashboard-botellas', component: DashboardBotellasComponent },
     
      // Control de Usuarios (Firestore)
      { path: 'usuarios', component: UsuariosComponent },

      // Terminal Ingesta IoT (Simulador / Ingesta física)
      { path: 'reciclaje', component: SesionReciclajeComponent },

      // Catálogo Maestro de Premios / Canjes
      { path: 'catalogo', component: CatalogoComponent },

      // 🟢 CORRECCIÓN: Ahora apunta de manera única al ReportesNucleoComponent
      { path: 'reportes', component: ReportesNucleoComponent },

      // Redirección por defecto al entrar a la raíz del panel
      { path: '', redirectTo: 'dashboard-botellas', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'panel/dashboard-botellas' } 
];