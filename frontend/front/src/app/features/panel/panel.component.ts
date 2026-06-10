import { Component } from '@angular/core';
// 1. IMPORTAMOS LAS HERRAMIENTAS DE ENRUTAMIENTO
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-panel',
  standalone: true, // Asegúrate de que tenga esta línea si es un componente Standalone
  imports: [
    // 2. LAS AGREGAMOS AQUÍ PARA QUE EL HTML RECONOZCA EL routerLink Y EL <router-outlet>
    RouterOutlet, 
    RouterModule 
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent {
  // Tu lógica del componente se queda limpia por ahora
}