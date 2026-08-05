import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
  errorCode: string = '404';
  errorMessage: string = 'Página no encontrada';
  errorDescription: string = 'La página que buscas ha sido reciclada o no existe.';
  imageSrc: string = '/sad_trash_can.png'; // La imagen generada

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      if (code) {
        this.errorCode = code;
        this.setPropertiesBasedOnCode(code);
      }
    });
  }

  setPropertiesBasedOnCode(code: string): void {
    switch (code) {
      case '403':
        this.errorMessage = 'Acceso Denegado';
        this.errorDescription = 'No tienes los permisos necesarios para ver esta página. ¡Nuestro bote de basura está triste porque no puedes entrar!';
        break;
      case '500':
        this.errorMessage = 'Error Interno del Servidor';
        this.errorDescription = 'Algo se rompió de nuestro lado. Estamos trabajando para arreglarlo lo antes posible.';
        break;
      case '404':
      default:
        this.errorCode = '404';
        this.errorMessage = 'Página no encontrada';
        this.errorDescription = 'La ruta a la que intentas acceder parece que ya fue reciclada o nunca existió.';
        break;
    }
  }

  volverAlInicio(): void {
    this.router.navigate(['/login']);
  }
}
