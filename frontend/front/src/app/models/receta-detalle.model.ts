export interface RecetaDetalle {
    id?: string;
    recetaId: string;
    materiaPrimaId: string;
    nombreMateriaPrima: string;
    cantidad: number;
    unidadMedida: string;
    observaciones?: string;
  }