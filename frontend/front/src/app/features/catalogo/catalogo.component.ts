import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 🌟 Importamos el servicio desde core (o donde lo tengas guardado ahora)
import { RecompensaService, Recompensa } from '../../core/services/recompensa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule], // 👈 NO agregues HttpClientModule aquí para que no rompa el contexto de Firebase
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  listaRecompensas: Recompensa[] = [];
  cargando: boolean = true;

  constructor(private recompensaService: RecompensaService) {}

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.recompensaService.obtenerRecompensas().subscribe({
      next: (response: any) => { 
        if (response && response.succeeded) {
          this.listaRecompensas = response.data;
        } else {
          this.listaRecompensas = response?.data || [];
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error al cargar catálogo:', err);
        // Colocamos datos quemados (mock) temporales por si tu backend C# no está corriendo
        this.listaRecompensas = [
          { id: '1', nombre: 'Café Americano Caliente', costoPuntos: 50, stock: 45, activa: true },
          { id: '2', nombre: 'Bolsa Ecológica Reforzada', costoPuntos: 30, stock: 120, activa: true },
          { id: '3', nombre: 'Donación Árbol Endémico', costoPuntos: 100, stock: -1, activa: true }
        ];
      }
    });
  }

  procesarCanje(recompensa: Recompensa): void {
    Swal.fire('¡Éxito!', `Canje de ${recompensa.nombre} procesado.`, 'success');
  }

  obtenerEmoji(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('café') || n.includes('cafe')) return '☕';
    if (n.includes('bolsa') || n.includes('mochila')) return '👜';
    if (n.includes('árbol') || n.includes('arbol') || n.includes('planta')) return '🌲';
    return '🎁';
  }
}