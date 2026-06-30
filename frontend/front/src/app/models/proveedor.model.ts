export interface Proveedor {
  id: string;
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface ProveedorCrear {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
  direccion: string;
}
