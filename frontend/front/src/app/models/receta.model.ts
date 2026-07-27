export interface Receta {
    id?: string;
    productoId: string;
    nombreProducto: string;
    descripcion?: string;
    version: number;
    tiempoEstimadoMinutos: number;
    activo: boolean;
    fechaCreacion?: Date | string;
  }