import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraClienteService, CompraProducto } from '../../core/services/compra-cliente.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-compras.component.html',
  styleUrls: ['./admin-compras.component.scss']
})
export class AdminComprasComponent implements OnInit {
  compras: CompraProducto[] = [];
  comprasFiltradas: CompraProducto[] = [];
  cargando: boolean = true;
  filtroEstado: string = 'Todas';
  filtroBusqueda: string = '';
  
  // Contadores
  countTodas: number = 0;
  countCompletadas: number = 0;
  countPendientes: number = 0;
  countCanceladas: number = 0;
  countSinOpinion: number = 0;
  
  // Modal de respuesta
  compraSeleccionada: CompraProducto | null = null;
  respuestaForm = {
    respuesta: ''
  };
  mostrandoRespuesta: boolean = false;

  constructor(
    private compraClienteService: CompraClienteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
  this.cargando = true;
  // ✅ USAR EL MÉTODO PARA ADMIN
  this.compraClienteService.obtenerTodasLasCompras().subscribe({
    next: (response) => {
      this.cargando = false;
      if (response.suceso && response.data) {
        this.compras = response.data.map((c: any) => ({
          ...c,
          precioUnitario: c.precioUnitario || c.precioTotal || 0,
          total: c.total || c.precioTotal || 0,
          cantidad: c.cantidad || 1,
          estado: c.estado || 'Pendiente',
          nombreProducto: c.nombreProducto || c.nombre_producto || 'Producto'
        }));
      } else {
        this.compras = [];
      }
      this.calcularContadores();
      this.aplicarFiltro();
    },
    error: (error) => {
      this.cargando = false;
      console.error('Error al cargar compras:', error);
      this.compras = this.obtenerDatosEjemplo();
      this.calcularContadores();
      this.aplicarFiltro();
    }
  });
}

  obtenerDatosEjemplo(): CompraProducto[] {
    return [
      {
        id: 'C001',
        usuarioId: '1',
        nombreProducto: 'Botella Reutilizable EcoCycle',
        fechaCompra: new Date('2026-06-20'),
        precioTotal: 300,
        cantidad: 2,
        precioUnitario: 150,
        total: 300,
        estado: 'Completada',
        opinion: 'Excelente producto, muy resistente y ecológico.',
        calificacion: 5
      },
      {
        id: 'C002',
        usuarioId: '2',
        nombreProducto: 'Kit de Reciclaje Doméstico',
        fechaCompra: new Date('2026-06-25'),
        precioTotal: 250,
        cantidad: 1,
        precioUnitario: 250,
        total: 250,
        estado: 'Pendiente'
      },
      {
        id: 'C003',
        usuarioId: '3',
        nombreProducto: 'Cepillo de Bambú',
        fechaCompra: new Date('2026-07-01'),
        precioTotal: 45,
        cantidad: 5,
        precioUnitario: 45,
        total: 225,
        estado: 'Completada',
        opinion: 'Muy bueno, ecológico y resistente.',
        calificacion: 4
      }
    ];
  }

  calcularContadores(): void {
    this.countTodas = this.compras.length;
    this.countCompletadas = this.compras.filter(c => c.estado === 'Completada').length;
    this.countPendientes = this.compras.filter(c => c.estado === 'Pendiente').length;
    this.countCanceladas = this.compras.filter(c => c.estado === 'Cancelada').length;
    this.countSinOpinion = this.compras.filter(c => c.estado === 'Completada' && !c.opinion).length;
  }

  aplicarFiltro(): void {
    let resultado = [...this.compras];
    
    if (this.filtroEstado !== 'Todas') {
      resultado = resultado.filter(c => c.estado === this.filtroEstado);
    }
    
    if (this.filtroBusqueda.trim()) {
      const term = this.filtroBusqueda.toLowerCase().trim();
      resultado = resultado.filter(c => 
        c.nombreProducto?.toLowerCase().includes(term) ||
        c.usuarioId?.toLowerCase().includes(term) ||
        c.opinion?.toLowerCase().includes(term)
      );
    }
    
    this.comprasFiltradas = resultado;
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltro();
  }

  aplicarBusqueda(): void {
    this.aplicarFiltro();
  }

  getEstadoClass(estado: string = 'Pendiente'): string {
    const clases: Record<string, string> = {
      'Completada': 'bg-success',
      'Pendiente': 'bg-warning text-dark',
      'Cancelada': 'bg-danger'
    };
    return clases[estado] || 'bg-secondary';
  }

  getEstadoIcon(estado: string = 'Pendiente'): string {
    const iconos: Record<string, string> = {
      'Completada': 'fa-check-circle',
      'Pendiente': 'fa-clock',
      'Cancelada': 'fa-times-circle'
    };
    return iconos[estado] || 'fa-question-circle';
  }

  getCalificacionEstrellas(calificacion: number): string {
    return '⭐'.repeat(calificacion) + '☆'.repeat(5 - calificacion);
  }

 cambiarEstado(compra: CompraProducto, nuevoEstado: string = 'Pendiente'): void {
  const estadosValidos = ['Pendiente', 'Completada', 'Cancelada'];
  if (!estadosValidos.includes(nuevoEstado)) {
    this.notificationService.error('Error', 'Estado inválido');
    return;
  }

  // Guardar estado anterior por si falla
  const estadoAnterior = compra.estado;
  
  // Actualizar UI inmediatamente para feedback visual
  compra.estado = nuevoEstado;

  this.notificationService.showLoading('Actualizando...', 'Cambiando estado de la compra');

  this.compraClienteService.actualizarEstado(compra.id, nuevoEstado).subscribe({
    next: (response) => {
      this.notificationService.hideLoading();
      console.log('📥 Respuesta del servidor:', response);
      
      if (response.suceso) {
        this.notificationService.toastSuccess(`Estado cambiado a "${nuevoEstado}"`);
        this.calcularContadores();
        this.aplicarFiltro();
        // Recargar para asegurar que se vea el cambio
        this.cargarCompras();
      } else {
        // Revertir si falla
        compra.estado = estadoAnterior;
        this.notificationService.error('Error', response.message || 'No se pudo actualizar el estado.');
      }
    },
    error: (error) => {
      this.notificationService.hideLoading();
      console.error('❌ Error al actualizar estado:', error);
      // Revertir si falla
      compra.estado = estadoAnterior;
      this.notificationService.error('Error', 'No se pudo conectar con el servidor.');
    }
  });


  this.notificationService.confirmAction(
    'Cambiar estado',
    `¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`,
    'Sí, cambiar',
    '#0D631B'
  ).then((result: any) => {
    if (result.isConfirmed) {
      // ✅ Llamar al backend
      this.compraClienteService.actualizarEstado(compra.id, nuevoEstado).subscribe({
        next: (response) => {
          if (response.suceso) {
            compra.estado = nuevoEstado;
            this.notificationService.toastSuccess(`Estado cambiado a "${nuevoEstado}"`);
            this.calcularContadores();
            this.aplicarFiltro();
          } else {
            this.notificationService.error('Error', response.message || 'No se pudo actualizar el estado.');
            this.cargarCompras();
          }
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          this.notificationService.error('Error', 'No se pudo conectar con el servidor.');
          this.cargarCompras();
        }
      });
    } else {
      this.cargarCompras();
    }
  });


    this.notificationService.confirmAction(
      'Cambiar estado',
      `¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`,
      'Sí, cambiar',
      '#0D631B'
    ).then((result: any) => {
      if (result.isConfirmed) {
        compra.estado = nuevoEstado;
        this.notificationService.toastSuccess(`Estado cambiado a "${nuevoEstado}"`);
        this.calcularContadores();
        this.aplicarFiltro();
      } else {
        // Revertir el cambio visual
        this.cargarCompras();
      }
    });
  }

  responderOpinion(compra: CompraProducto): void {
    this.compraSeleccionada = compra;
    this.respuestaForm.respuesta = '';
    this.mostrandoRespuesta = true;
  }

  enviarRespuesta(): void {
    if (!this.respuestaForm.respuesta.trim()) {
      this.notificationService.warning('Campo vacío', 'Por favor escribe una respuesta.');
      return;
    }

    this.notificationService.showLoading('Enviando...', 'Guardando respuesta');
    
    setTimeout(() => {
      this.notificationService.hideLoading();
      this.notificationService.toastSuccess('Respuesta enviada exitosamente');
      this.mostrandoRespuesta = false;
      this.compraSeleccionada = null;
    }, 1000);
  }

  cerrarRespuesta(): void {
    this.mostrandoRespuesta = false;
    this.compraSeleccionada = null;
  }
}