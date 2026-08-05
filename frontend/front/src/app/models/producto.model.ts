export interface Producto {
    id?: string;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    activo: boolean;
  }

  export interface DetalleRecetaInput {
    materiaPrimaId: string;
    nombreMateriaPrima: string;
    cantidad: number;
    unidadMedida: string;
    observaciones?: string;
  
  }

  export interface ProductoCompletoResponse {

    productoId: string;
    recetaId: string;
    nombre: string;
    descripcion: string;
    imagenUrl?: string;
    activo: boolean;
    tiempoEstimadoMinutos: number;
    insumos: DetalleRecetaInput[];

  }

  export interface CrearProductoCompletoRequest {
    nombre: string;
    descripcion: string;
    imagenUrl?: string;
    tiempoEstimadoMinutos: number;
    insumos: DetalleRecetaInput[];
  }