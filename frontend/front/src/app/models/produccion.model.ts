export interface MaterialConsumido {
  materiaPrimaId: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
}

export interface Produccion {
  id: string;
  productoId: string;
  nombreProducto: string;
  recetaId: string;
  cantidad: number;
  costoTotal: number;
  estado: string;
  observaciones?: string;
  usuarioId: string;
  fecha: string;
  materialesConsumidos: MaterialConsumido[];
}

export interface CrearProduccionRequest {
  productoId: string;
  cantidad: number;
  observaciones?: string;
}
