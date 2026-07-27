import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BarComponent } from '../../shared/components/bar/bar.component';
import { ComentariosService } from '../../core/services/comentario.service';
import { NotificationService } from '../../core/services/notification.service';
import { Comentario } from '../../models/comentario.model';
import { CotizacionesService as TestService } from '../../core/services/cotizaciones.service';


export interface Step {
  number: string;
  title: string;
  description: string;
  iconPath: string;
  imageUrl: string;
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    CommonModule,
    BarComponent,
    ReactiveFormsModule
  ],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss'
})

export class ProductoComponent implements OnInit {

  steps: Step[] = [
    {
      number: '01',
      title: 'Regístrate en la Plataforma',
      description: 'Crea tu cuenta en menos de un minuto para acceder a las campañas activas y seguir tu impacto.',
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      imageUrl: '/home/slider_home4.avif'
    },
    {
      number: '02',
      title: 'Deposita tus Materiales',
      description: 'Acércate a nuestros puntos de acopio o contenedores inteligentes y clasifica tu plástico PET o aluminio.',
      iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      imageUrl: '/home/slider_home3.jpg'
    },
    {
      number: '03',
      title: 'Acumula Puntos y Recompensas',
      description: 'Por cada depósito escaneado recibes puntos instantáneos en tu perfil canjeables por beneficios.',
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      imageUrl: '/home/slider_home5.webp'
    }
  ];

  public mainImage = signal<string>('/maquina1.jpg');

  public currentDate: string = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  comentarioForm: FormGroup;
  cargando = false;
  mostrarModalCotizacion = false;
  currentStep = 1;
  totalSteps = 4;
  cargandoCotizacion = false;
  cotizacionEnviada = false;

  cotizacionForm!: FormGroup;

  public listaComentarios: Comentario[] = [];
  public cargandoComentarios: boolean = true;

  constructor(
    private fb: FormBuilder,
    private cotizacionesService: TestService,
    private comentariosService: ComentariosService,
    private notificationService: NotificationService
  ) {


    this.comentarioForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mensaje: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ],
      estrellas: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    this.cotizacionForm = this.fb.group({
      tipoProyecto: ['', Validators.required],
      cantidadMaquinas: [1, [Validators.required, Validators.min(1)]],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      materiales: [[]],
      objetivo: ['', Validators.required],
      descripcion: [''],
      personasImpactadas: [''],
      fechaImplementacion: [''],
      nombre: ['', Validators.required],

      empresa: [''],

      cargo: [''],

      correo: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      telefono: ['', Validators.required],

      medioContacto: [
        'WhatsApp',
        Validators.required
      ],

      aceptaAviso: [
        false,
        Validators.requiredTrue
      ]

    });

  }

  get progreso(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  ngOnInit(): void {
    this.cargarOpinionesPublicas();
  }

  abrirCotizacion(): void {
    console.log("abrircotizacion");
    this.currentStep = 1;
    this.cotizacionForm.reset({ cantidadMaquinas: 1, materiales: [], aceptaAviso: false });
    this.mostrarModalCotizacion = true;
  }

  siguientePaso(): void {
    if (!this.validarPaso()) {
      return;
    }
    this.currentStep++;
  }

  anteriorPaso(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validarPaso(): boolean {

    switch (this.currentStep) {
      case 1:

        this.cotizacionForm.get('tipoProyecto')?.markAsTouched();
        return this.cotizacionForm.get('tipoProyecto')?.valid ?? false;

      case 2:
        this.cotizacionForm.get('cantidadMaquinas')?.markAsTouched();
        this.cotizacionForm.get('ciudad')?.markAsTouched();
        this.cotizacionForm.get('estado')?.markAsTouched();
        return (
          this.cotizacionForm.get('cantidadMaquinas')?.valid &&
          this.cotizacionForm.get('ciudad')?.valid &&
          this.cotizacionForm.get('estado')?.valid
        ) ?? false;
      case 3:
        this.cotizacionForm.get('objetivo')?.markAsTouched();
        return this.cotizacionForm.get('objetivo')?.valid ?? false;
      case 4:
        this.cotizacionForm.get('medioContacto')?.markAsTouched();
        this.cotizacionForm.get('nombre')?.markAsTouched();
        this.cotizacionForm.get('correo')?.markAsTouched();
        this.cotizacionForm.get('telefono')?.markAsTouched();
        this.cotizacionForm.get('aceptaAviso')?.markAsTouched();
        return (
          this.cotizacionForm.get('nombre')?.valid &&
          this.cotizacionForm.get('correo')?.valid &&
          this.cotizacionForm.get('telefono')?.valid &&
          this.cotizacionForm.get('medioContacto')?.valid &&
          this.cotizacionForm.get('aceptaAviso')?.valid
        ) ?? false;
      default:
        return true;
    }
  }

  enviarCotizacion(): void {
    if (!this.validarPaso()) {
      return;
    }

    this.cargandoCotizacion = true;

    const datosCotizacion = {
      ...this.cotizacionForm.value,
      personasImpactadas: this.cotizacionForm.value.personasImpactadas 
        ? Number(this.cotizacionForm.value.personasImpactadas) 
        : null
    };

    this.cotizacionesService.crear(datosCotizacion).subscribe({
      next: (res) => {
        this.cargandoCotizacion = false;
        this.cotizacionEnviada = true;
        
        this.notificationService.success(
          'Solicitud enviada',
          'En breve uno de nuestros asesores se pondrá en contacto contigo.'
        );
      },
      error: (err) => {
        this.cargandoCotizacion = false;
        console.error('Error al registrar la cotización:', err);
        
        this.notificationService.error(
          'Error al enviar',
          'Ocurrió un problema al procesar tu solicitud. Inténtalo nuevamente.'
        );
      }
    });
  }

  cerrarCotizacion(): void {

    this.cotizacionEnviada = false;
    this.currentStep = 1;
  
    this.cotizacionForm.reset({
      cantidadMaquinas: 1,
      materiales: [],
      medioContacto: 'WhatsApp',
      aceptaAviso: false
    });
    this.mostrarModalCotizacion = false;
  }

  materialesDisponibles = [
    'PET',
    'Vidrio',
    'Otro'
  ];

  toggleMaterial(material: string): void {

    const materiales = this.cotizacionForm.get('materiales')?.value as string[];

    if (materiales.includes(material)) {

      this.cotizacionForm.patchValue({
        materiales: materiales.filter(x => x !== material)
      });

    } else {

      this.cotizacionForm.patchValue({
        materiales: [...materiales, material]
      });
    }
  }

  materialSeleccionado(material: string): boolean {
    return this.cotizacionForm.get('materiales')?.value.includes(material);
  }

  private cargarOpinionesPublicas(): void {
    this.comentariosService.obtenerPublicos().subscribe({
      next: (comentarios) => {
        this.listaComentarios = comentarios;
        this.cargandoComentarios = false;
      },
      error: (err) => {
        console.error('Error al cargar las opiniones de la comunidad', err);
        this.cargandoComentarios = false;
      }
    });
  }

  public obtenerIniciales(email: string): string {
    if (!email) return '??';
    const usuario = email.split('@')[0];
    return usuario.substring(0, 2).toUpperCase();
  }

  public formatearEmail(email: string): string {
    if (!email) return 'Usuario de EcoCycle';
    const partes = email.split('@');
    const nombreUsuario = partes[0];
    const dominio = partes[1];
    if (nombreUsuario.length <= 2) return `***@${dominio}`;
    return `${nombreUsuario.substring(0, 2)}***@${dominio}`;
  }

  /**
   * Cambia la imagen principal del showcase
   */
  public changeImage(newSrc: string): void {
    this.mainImage.set(newSrc);
  }

  enviarComentario(): void {
    if (this.comentarioForm.invalid) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // Mostramos el indicador visual de carga antes de la petición
    if (this.notificationService.showLoading) {
      this.notificationService.showLoading();
    }

    this.comentariosService.crear(this.comentarioForm.value)
      .subscribe({
        next: (response) => {
          console.log(response);

          this.notificationService.hideLoading();

          this.notificationService.success(
            'Mensaje enviado',
            response.mensaje || 'Nos pondremos en contacto contigo lo antes posible.'
          );

          this.comentarioForm.reset({ estrellas: 5 });
          this.cargando = false;
          this.cargarOpinionesPublicas();
        },
        error: (error) => {
          console.error(error);

          this.notificationService.hideLoading();

          this.notificationService.error(
            'Error',
            'Ocurrió un error al enviar el mensaje.'
          );

          this.cargando = false;
        }
      });
  }
}