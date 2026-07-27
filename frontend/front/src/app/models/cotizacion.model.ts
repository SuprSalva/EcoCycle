export interface Cotizacion {
    id?: string;
    tipoProyecto: string;
    cantidadMaquinas: number;
    ciudad: string;
    estado: string;
    materiales: string[];
    objetivo: string;
    descripcion?: string;
    personasImpactadas?: number;
    fechaImplementacion?: string;
    nombre: string;
    empresa?: string;
    cargo?: string;
    correo: string;
    telefono: string;
    medioContacto: string;
    aceptaAviso: boolean;
    estatus?: string;
    fechaCreacion?: string;
  }