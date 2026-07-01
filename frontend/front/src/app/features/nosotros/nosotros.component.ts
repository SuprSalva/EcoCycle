import { Component } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.scss'
})

export class NosotrosComponent {
    
    getCurrentDateFormatted(): string {
        const fecha = new Date();
    
        return fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      }

}