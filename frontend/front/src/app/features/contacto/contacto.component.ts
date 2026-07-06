import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { BarComponent } from '../../shared/components/bar/bar.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [BarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss'
})

export class ContactoComponent {

  formulario!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      mensaje: ['', Validators.required]
    });
  }

  enviarReporte(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.notificationService.showLoading(
      'Enviando mensaje...',
      'Espere un momento'
    );

    this.reporteService.crearReporte(this.formulario.value).subscribe({

      next: (response: any) => {

        this.notificationService.hideLoading();
      
        this.notificationService.success(
          'Mensaje enviado',
          response.mensaje || 'Nos pondremos en contacto contigo lo antes posible.'
        );
      
        this.formulario.reset();
      
      },
      
      error: () => {

        this.notificationService.hideLoading();

        this.notificationService.error(
          'Error',
          'Ocurrió un error al enviar el mensaje.'
        );

      }

    });

  }

}
