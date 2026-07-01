export interface DetalleCompra {
  materiaPrimaId?: string;
  nombreMateriaPrima: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CompraProveedor {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  fechaCompra: string;
  total: number;
  estado: string;
  detalles: DetalleCompra[];
}

export interface CompraProveedorCrear {
  proveedorId: string;
  proveedorNombre: string;
  detalles: DetalleCompra[];
}
