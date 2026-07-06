// 📁 src/app/features/compras-cliente/compras-cliente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraClienteService, CompraProducto, RegistrarCompraRequest } from '../../core/services/compra-cliente.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

export interface ProductoDisponible {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  manualUrl?: string;
}

@Component({
  selector: 'app-compras-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './compras-cliente.component.html',
  styleUrls: ['./compras-cliente.component.scss']
})
export class ComprasClienteComponent implements OnInit {
  compras: CompraProducto[] = [];
  comprasFiltradas: CompraProducto[] = [];
  cargando: boolean = true;
  filtroEstado: string = 'Todas';
  
  // Estadísticas
  totalProductos: number = 0;
  totalOpiniones: number = 0;
  totalPendientes: number = 0;
  totalGastado: number = 0;
  totalCompras: number = 0;
  
  // Contadores
  countTodas: number = 0;
  countCompletadas: number = 0;
  countPendientes: number = 0;
  countCanceladas: number = 0;
  
  // Modal de opinión
  compraSeleccionada: CompraProducto | null = null;
  opinionForm = {
    calificacion: 5,
    comentario: ''
  };
  mostrandoOpinion: boolean = false;
  
  // Nueva compra
  mostrarFormularioCompra: boolean = false;
  productosDisponibles: ProductoDisponible[] = [];
  nuevaCompra: RegistrarCompraRequest = {
    productoId: '',
    nombreProducto: '',
    cantidad: 1,
    precioUnitario: 0
  };
  cargandoProductos: boolean = false;
  perfil: any = null;

  constructor(
    private compraClienteService: CompraClienteService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.obtenerPerfilUsuario().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.cargarCompras();
        this.cargarProductos();
      },
      error: () => {
        this.cargarCompras();
        this.cargarProductos();
      }
    });
  }

  cargarCompras(): void {
    this.cargando = true;
    this.compraClienteService.obtenerMisCompras().subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.suceso && response.data) {
          this.compras = response.data.map((c: any) => ({
            ...c,
            precioUnitario: c.precioUnitario || c.precioTotal || 0,
            total: c.total || c.precioTotal || 0,
            cantidad: c.cantidad || 1,
            estado: c.estado || (c.opinion ? 'Completada' : 'Pendiente'),
            nombreProducto: c.nombreProducto || c.nombre_producto || 'Producto'
          }));
        } else {
          this.compras = [];
        }
        this.calcularEstadisticas();
        this.calcularContadores();
        this.aplicarFiltro();
      },
      error: () => {
        this.cargando = false;
        this.compras = this.obtenerDatosEjemplo();
        this.calcularEstadisticas();
        this.calcularContadores();
        this.aplicarFiltro();
      }
    });
  }

  cargarProductos(): void {
    this.cargandoProductos = true;
    setTimeout(() => {
      this.cargandoProductos = false;
      this.productosDisponibles = [
        { id: 'P1', nombre: 'Botella Reutilizable EcoCycle', precio: 150, stock: 50, manualUrl: '/manuales/botella.pdf' },
        { id: 'P2', nombre: 'Kit de Reciclaje Doméstico', precio: 250, stock: 30, manualUrl: '/manuales/kit.pdf' },
        { id: 'P3', nombre: 'Cepillo de Bambú', precio: 45, stock: 100, manualUrl: '/manuales/cepillo.pdf' },
        { id: 'P4', nombre: 'Termo Ecológico', precio: 180, stock: 25, manualUrl: '/manuales/termo.pdf' },
        { id: 'P5', nombre: 'Bolsa Reutilizable', precio: 40, stock: 80, manualUrl: '/manuales/bolsa.pdf' }
      ];
    }, 300);
  }

  // ✅ CORREGIDO: Seleccionar producto con valor por defecto
  seleccionarProducto(productoId: string): void {
    if (!productoId) {
      this.nuevaCompra = { productoId: '', nombreProducto: '', cantidad: 1, precioUnitario: 0 };
      return;
    }
    
    const producto = this.productosDisponibles.find(p => p.id === productoId);
    if (producto) {
      this.nuevaCompra.productoId = producto.id;
      this.nuevaCompra.nombreProducto = producto.nombre;
      this.nuevaCompra.precioUnitario = producto.precio;
      this.nuevaCompra.cantidad = 1;
      this.nuevaCompra.manualUrl = producto.manualUrl;
    }
  }

  registrarCompra(): void {
    if (!this.nuevaCompra.productoId) {
      this.notificationService.warning('Selecciona un producto', 'Por favor selecciona un producto para comprar.');
      return;
    }
    if (this.nuevaCompra.cantidad < 1) {
      this.notificationService.warning('Cantidad inválida', 'La cantidad debe ser mayor a 0.');
      return;
    }

    this.notificationService.showLoading('Procesando...', 'Registrando tu compra');

    this.compraClienteService.registrarCompra(this.nuevaCompra).subscribe({
      next: (response) => {
        this.notificationService.hideLoading();
        if (response.suceso) {
          this.notificationService.toastSuccess('¡Compra realizada exitosamente!');
          this.mostrarFormularioCompra = false;
          this.nuevaCompra = { productoId: '', nombreProducto: '', cantidad: 1, precioUnitario: 0 };
          this.cargarCompras();
        } else {
          this.notificationService.error('Error', response.message || 'No se pudo registrar la compra.');
        }
      },
      error: () => {
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudo conectar con el servidor.');
      }
    });
  }

  toggleFormularioCompra(): void {
    this.mostrarFormularioCompra = !this.mostrarFormularioCompra;
    if (!this.mostrarFormularioCompra) {
      this.nuevaCompra = { productoId: '', nombreProducto: '', cantidad: 1, precioUnitario: 0 };
    }
  }

  calcularTotal(): number {
    return this.nuevaCompra.cantidad * this.nuevaCompra.precioUnitario;
  }

  calcularEstadisticas(): void {
    this.totalCompras = this.compras.length;
    this.totalProductos = this.compras.reduce((sum, c) => sum + (c.cantidad || 1), 0);
    this.totalOpiniones = this.compras.filter(c => c.opinion).length;
    this.totalPendientes = this.compras.filter(c => c.estado === 'Pendiente').length;
    this.totalGastado = this.compras.reduce((sum, c) => sum + (c.total || 0), 0);
  }

  calcularContadores(): void {
    this.countTodas = this.compras.length;
    this.countCompletadas = this.compras.filter(c => c.estado === 'Completada').length;
    this.countPendientes = this.compras.filter(c => c.estado === 'Pendiente').length;
    this.countCanceladas = this.compras.filter(c => c.estado === 'Cancelada').length;
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
        usuarioId: '1',
        nombreProducto: 'Kit de Reciclaje Doméstico',
        fechaCompra: new Date('2026-06-25'),
        precioTotal: 250,
        cantidad: 1,
        precioUnitario: 250,
        total: 250,
        estado: 'Pendiente'
      }
    ];
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'Todas') {
      this.comprasFiltradas = [...this.compras];
    } else {
      this.comprasFiltradas = this.compras.filter(c => c.estado === this.filtroEstado);
    }
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
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

  abrirOpinion(compra: CompraProducto): void {
    if (compra.opinion) {
      this.notificationService.warning('Ya opinaste', 'Ya dejaste una opinión para esta compra.');
      return;
    }
    if (compra.estado !== 'Completada') {
      this.notificationService.warning('Compra pendiente', 'Solo puedes opinar sobre compras completadas.');
      return;
    }
    this.compraSeleccionada = compra;
    this.opinionForm = { calificacion: 5, comentario: '' };
    this.mostrandoOpinion = true;
  }

  enviarOpinion(): void {
    if (!this.opinionForm.comentario.trim()) {
      this.notificationService.warning('Campos Incompletos', 'Por favor escribe un comentario.');
      return;
    }
    if (!this.compraSeleccionada) return;

    this.notificationService.showLoading('Enviando...', 'Publicando tu opinión');
    
    this.compraClienteService.dejarOpinion(
      this.compraSeleccionada.id,
      this.opinionForm.comentario,
      this.opinionForm.calificacion
    ).subscribe({
      next: (response) => {
        this.notificationService.hideLoading();
        if (response.suceso) {
          if (this.compraSeleccionada) {
            this.compraSeleccionada.opinion = this.opinionForm.comentario;
            this.compraSeleccionada.calificacion = this.opinionForm.calificacion;
          }
          this.notificationService.toastSuccess('¡Opinión enviada exitosamente!');
          this.mostrandoOpinion = false;
          this.compraSeleccionada = null;
          this.cargarCompras();
        } else {
          this.notificationService.error('Error', response.message || 'No se pudo enviar la opinión.');
        }
      },
      error: () => {
        this.notificationService.hideLoading();
        this.notificationService.error('Error', 'No se pudo conectar con el servidor.');
      }
    });
  }

  cerrarOpinion(): void {
    this.mostrandoOpinion = false;
    this.compraSeleccionada = null;
  }
}