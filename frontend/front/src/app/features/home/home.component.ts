import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BarComponent } from '../../shared/components/bar/bar.component';

export interface FeatureCard {
    iconPath: string;
    title: string;
    text: string;
}

export interface Step {
    number: string;
    title: string;
    description: string;
    iconPath: string;
    imageUrl: string;
  }

export interface Campaign {
    badge: string;
    title: string;
    description: string;
    progress: number; 
    goalText: string;
    impactText: string;
    imageUrl: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [BarComponent, CommonModule, ReactiveFormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})

export class HomeComponent {

    steps: Step[] = [
        {
          number: '01',
          title: 'Regístrate en la Plataforma',
          description: 'Crea tu cuenta en menos de un minuto para acceder a las campañas activas y seguir tu impacto.',
          iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          imageUrl:'/home/slider_home4.avif'
        },
        {
          number: '02',
          title: 'Deposita tus Materiales',
          description: 'Acércate a nuestros puntos de acopio o contenedores inteligentes y clasifica tu plástico PET o aluminio.',
          iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
          imageUrl:'/home/slider_home3.jpg'},
        {
          number: '03',
          title: 'Acumula Puntos y Recompensas',
          description: 'Por cada depósito escaneado recibes puntos instantáneos en tu perfil canjeables por beneficios.',
          iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          imageUrl:'/home/slider_home5.webp'}
      ];

    campaigns: Campaign[] = [
        {
          badge: 'En Curso',
          title: 'Recicla y Transforma',
          description: 'Campañas de recolección masiva de botellas PET para su posterior transformación en insumos ecológicos.',
          progress: 75,
          goalText: '15,000 / 20,000 Botellas',
          impactText: '+1.2 Toneladas de plástico reciclado',
          imageUrl: '/nosotros_img/card7.jpg'
        },
        {
          badge: 'Próxima',
          title: 'Reforestación Urbana',
          description: 'Jornadas comunitarias de plantación de árboles nativos en zonas urbanas para mejorar la calidad del aire.',
          progress: 40,
          goalText: '400 / 1,000 Árboles',
          impactText: 'Reducción estimada de CO2: 5 Ton',
          imageUrl: '/nosotros_img/card3.jpeg'
        },
        {
          badge: 'Destacada',
          title: 'Cero Residuos en Escuelas',
          description: 'Talleres e instalación de contenedores inteligentes en instituciones educativas para fomentar el reciclaje.',
          progress: 90,
          goalText: '18 / 20 Escuelas equipadas',
          impactText: '+5,000 Estudiantes educados',
          imageUrl: '/nosotros_img/card4.jpg'
        }
      ];

    @ViewChild('featuresGrid') featuresGrid!: ElementRef<HTMLDivElement>;

    features: FeatureCard[] = [
        {
            iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
            title: 'Alta Velocidad',
            text: 'Optimizado desde el primer día para ofrecer el mejor rendimiento y tiempos de respuesta ultrarrápidos.'
        },
        {
            iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            title: 'Seguridad Total',
            text: 'Protección de datos garantizada implementando cifrado avanzado y estándares de la industria.'
        },
        {
            iconPath: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
            title: 'Diseño Responsive',
            text: 'Una interfaz fluida e intuitiva adaptada a la perfección para móviles, tablets y computadoras.'
        },
        {
            iconPath: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
            title: 'Soporte 24/7',
            text: 'Nuestro equipo de especialistas está disponible en todo momento para resolver cualquier duda.'
        },
        {
            iconPath: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
            title: 'Métricas en Tiempo Real',
            text: 'Visualiza reportes detallados y analíticas precisas sobre el rendimiento de tu plataforma.'
        },
        {
            iconPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
            title: 'Actualizaciones Continuas',
            text: 'Mejoras constantes de software y nuevas funcionalidades integradas automáticamente sin interrupciones.'
        }
    ];

    scrollFeatures(direction: 'left' | 'right'): void {
        const grid = this.featuresGrid.nativeElement;

        const scrollAmount = 340;

        if (direction === 'left') {
            grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    slides: string[] = [
        '/home/slider1.jpg',
        '/home/slider_home2.jpg',
        '/card15.avif'
    ];

    currentIndex: number = 0;

    nextSlide(): void {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }

    prevSlide(): void {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    }

    goToSlide(index: number): void {
        this.currentIndex = index;
    }

}
