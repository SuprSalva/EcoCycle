import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecompensaService, Recompensa } from '../../core/services/recompensa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule], 
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
        // 🌟 CORREGIDO: Mapeo resiliente de datos desde C# (Wrapper ApiResponse)
        if (response && response.suceso) {
          this.listaRecompensas = response.data;
        } else {
          this.listaRecompensas = response?.data || [];
        }
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        console.error('Error al cargar catálogo:', err);
        this.listaRecompensas = [
          { id: '1', nombre: 'Café Americano Caliente', costoPuntos: 50, stock: 45, activa: true },
          { id: '2', nombre: 'Bolsa Ecológica Reforzada', costoPuntos: 30, stock: 120, activa: true },
          { id: '3', nombre: 'Donación Árbol Endémico', costoPuntos: 100, stock: -1, activa: true }
        ];
      }
    });
  }

  procesarCanje(recompensa: Recompensa): void {
    this.recompensaService.canjearRecompensa(recompensa.id).subscribe({
      next: (response: any) => {
        Swal.fire('¡Éxito!', response.message || `Canje de ${recompensa.nombre} procesado.`, 'success');
        this.cargarCatalogo();
      },
      error: (err: any) => {
        console.error('Error al canjear:', err);
        Swal.fire('Error', err.error?.message || 'No se pudo completar el canje.', 'error');
      }
    });
  }

  abrirFormularioAgregar(): void {
    Swal.fire({
      title: 'Nueva Recompensa',
      html: `
        <div class="text-start p-2">
          <label class="form-label fw-bold">Nombre del Producto</label>
          <input id="swal-nombre" class="form-control mb-3" placeholder="Ej. Termo de Acero Inoxidable">
          
          <label class="form-label fw-bold">Costo en EcoPts</label>
          <input id="swal-costo" type="number" class="form-control mb-3" placeholder="Ej. 150">
          
          <label class="form-label fw-bold">Stock Inicial</label>
          <input id="swal-stock" type="number" class="form-control" placeholder="Ej. 50">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-floppy-disk"></i> Guardar en BD',
      confirmButtonColor: '#111c43',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
        const costo = (document.getElementById('swal-costo') as HTMLInputElement).value;
        const stock = (document.getElementById('swal-stock') as HTMLInputElement).value;
        
        if (!nombre || !costo || !stock) {
          Swal.showValidationMessage('Por favor llena todos los campos obligatorios');
          return false;
        }
        // Retornamos llaves en minúsculas consistentes con el tratamiento del front
        return { nombre: nombre, costoPuntos: Number(costo), stock: Number(stock), activa: true };
      } 
    }).then((result) => {
      if (result.isConfirmed) {
        this.recompensaService.crearRecompensa(result.value).subscribe({
          next: (response: any) => {
            Swal.fire(
              '¡Guardado Real!',
              `La recompensa "${result.value.nombre}" se guardó permanentemente en la Base de Datos.`,
              'success'
            );
            this.cargarCatalogo(); 
          },
          error: (err: any) => {
            console.error('Error al guardar en C#:', err);
            Swal.fire('Error', 'No se pudo guardar en el servidor de C#.', 'error');
          }
        });
      }
    });
  }

  obtenerEmoji(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('café') || n.includes('cafe')) return '☕';
    if (n.includes('bolsa') || n.includes('mochila')) return '👜';
    if (n.includes('árbol') || n.includes('arbol') || n.includes('planta')) return '🌲';
    return '🎁';
  }
}