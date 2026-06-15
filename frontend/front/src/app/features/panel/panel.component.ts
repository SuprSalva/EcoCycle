import { Component, OnInit } from '@angular/core';
// 1. IMPORTAMOS LAS HERRAMIENTAS DE ENRUTAMIENTO
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-panel',
  standalone: true, // Asegúrate de que tenga esta línea si es un componente Standalone
  imports: [
    RouterOutlet, 
    RouterModule,
    CommonModule,
    SidebarComponent,
    NavbarComponent
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent implements OnInit {
  perfil: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (datos) => {
        this.perfil = datos;
      },
      error: (err) => {
        console.error('Error al obtener perfil', err);
        // Fallback para evitar que se quede en "Cargando perfil..." si el usuario no está en la BD
        this.perfil = {
          nombre: 'Usuario',
          apellidos: 'No Registrado',
          email: 'Falta completar registro',
          rol: 'invitado',
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