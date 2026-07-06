// 📁 src/app/features/panel-cliente/panel-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SidebarClienteComponent } from '../../shared/components/sidebar-cliente/sidebar-cliente.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-panel-cliente',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    SidebarClienteComponent
  ],
  templateUrl: './panel-cliente.component.html', 
  styleUrls: ['./panel-cliente.component.scss']  
})
export class PanelClienteComponent implements OnInit {
  perfil: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (datos: any) => {
        this.perfil = datos;
      },
      error: (err: any) => {
        console.error('Error al obtener perfil', err);
        this.perfil = {
          nombre: 'Cliente',
          apellidos: '',
          email: 'cliente@ecocycle.com',
          rol: 'cliente',
          saldoPuntos: 0
        };
      }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}