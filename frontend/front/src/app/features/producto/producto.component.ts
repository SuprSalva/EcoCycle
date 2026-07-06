import { Component, signal } from '@angular/core';
import { BarComponent } from '../../shared/components/bar/bar.component';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [BarComponent],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss'
})
export class ProductoComponent {
  public mainImage = signal<string>('/maquina1.jpg');

 public currentDate: string = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  /**
   * Cambia la imagen principal del showcase
   * @param newSrc Ruta de la nueva imagen
   */
  public changeImage(newSrc: string): void {
    this.mainImage.set(newSrc);
  }
}