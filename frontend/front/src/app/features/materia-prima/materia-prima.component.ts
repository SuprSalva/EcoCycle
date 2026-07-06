import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MateriaPrimaService, MateriaPrima, MateriaPrimaTransaccion } from '../../core/services/materia-prima.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materia-prima',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './materia-prima.component.html',
  styleUrls: ['./materia-prima.component.scss']
})
export class MateriaPrimaComponent implements OnInit {
  materias: MateriaPrima[] = [];
  vistaActual: 'lista' | 'formulario' | 'transaccion' = 'lista';
  
  formularioMateria: FormGroup;
  formularioTransaccion: FormGroup;
  
  materiaSeleccionada: MateriaPrima | null = null;
  cargando = false;

  // 🔍 Propiedades para Búsqueda y Paginación
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions: number[] = [5, 10, 20, 50];

  constructor(private fb: FormBuilder, private materiaPrimaService: MateriaPrimaService) {
    this.formularioMateria = this.fb.group({
      nombre: ['', Validators.required],
      unidad: ['', Validators.required]
    });

    this.formularioTransaccion = this.fb.group({
      tipo: ['Entrada', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      costoUnitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.cargarMaterias();
  }

  cargarMaterias() {
    this.cargando = true;
    this.materiaPrimaService.obtenerTodas().subscribe({
      next: (data) => {
        this.materias = data;
        this.cargando = false;
        this.currentPage = 1; // Resetea a la primera página al recargar datos
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  get materiasFiltradas(): MateriaPrima[] {
    if (!this.searchTerm.trim()) {
      return this.materias;
    }
    const search = this.searchTerm.toLowerCase().trim();
    return this.materias.filter(m => 
      m.nombre.toLowerCase().includes(search) || 
      (m.unidad && m.unidad.toLowerCase().includes(search))
    );
  }

  get materiasPaginadas(): MateriaPrima[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.materiasFiltradas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.materiasFiltradas.length / this.itemsPerPage) || 1;
  }

  cambiarItemsPorPagina(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1; 
  }

  anteriorPagina() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  siguientePagina() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // 🛠️ MÉTODOS EXISTENTES DE OPERACIÓN 

  crearNuevaMateria() {
    this.materiaSeleccionada = null;
    this.formularioMateria.reset();
    this.vistaActual = 'formulario';
  }

  editarMateria(materia: MateriaPrima, event: Event) {
    event.stopPropagation();
    this.materiaSeleccionada = materia;
    this.formularioMateria.patchValue({
      nombre: materia.nombre,
      unidad: materia.unidad
    });
    this.vistaActual = 'formulario';
  }

  eliminarMateria(materia: MateriaPrima, event: Event) {
    event.stopPropagation();
    if (!materia.id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la materia prima: ${materia.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.materiaPrimaService.eliminar(materia.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La materia prima ha sido eliminada.', 'success');
            this.cargarMaterias();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  registrarTransaccion(materia: MateriaPrima, event: Event) {
    event.stopPropagation();
    this.materiaSeleccionada = materia;
    this.formularioTransaccion.reset({ tipo: 'Entrada', cantidad: 1, costoUnitario: 0 });
    this.vistaActual = 'transaccion';
  }

  volverALista() {
    this.vistaActual = 'lista';
    this.cargarMaterias();
  }

  guardarMateria() {
    if (this.formularioMateria.invalid) return;
    
    if (this.materiaSeleccionada && this.materiaSeleccionada.id) {
      const dataToUpdate = {
        ...this.materiaSeleccionada,
        nombre: this.formularioMateria.value.nombre,
        unidad: this.formularioMateria.value.unidad
      };
      this.materiaPrimaService.actualizar(this.materiaSeleccionada.id, dataToUpdate).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Materia prima actualizada exitosamente.', 'success');
          this.volverALista();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar.', 'error')
      });
    } else {
      const materiaData: MateriaPrima = {
        nombre: this.formularioMateria.value.nombre,
        unidad: this.formularioMateria.value.unidad,
        stockActual: 0,
        costoPromedioUnitario: 0
      };

      this.materiaPrimaService.crear(materiaData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Materia prima creada exitosamente.', 'success');
          this.volverALista();
        },
        error: () => Swal.fire('Error', 'No se pudo crear.', 'error')
      });
    }
  }

  guardarTransaccion() {
    if (this.formularioTransaccion.invalid || !this.materiaSeleccionada?.id) return;
    
    const transaccion: MateriaPrimaTransaccion = this.formularioTransaccion.value;

    this.materiaPrimaService.registrarTransaccion(this.materiaSeleccionada.id, transaccion).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Transacción registrada correctamente.', 'success');
        this.volverALista();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Error al registrar transacción.', 'error');
      }
    });
  }
}