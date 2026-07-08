export interface Comentario {
    id?: string;          
    email: string;
    mensaje: string;
    estrellas: number;
    esPublico?: boolean;  
    estatus?: string;
    respuestaAdmin?: string; 
  }