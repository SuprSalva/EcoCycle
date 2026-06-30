import { Component } from '@angular/core';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss'
})

export class ProductoComponent {
    
    getCurrentDateFormatted(): string {
        const fecha = new Date();
    
        return fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      }

}