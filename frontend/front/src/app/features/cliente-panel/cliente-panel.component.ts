import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Shell del área "Mi cuenta": barra de pestañas (Perfil / Mis compras) + <router-outlet>.
// La edición de perfil y contraseña la maneja PerfilClienteComponent (ruta hija "perfil").
@Component({
  selector: 'app-cliente-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-panel.component.html',
  styleUrls: ['./cliente-panel.component.scss']
})
export class ClientePanelComponent {}
