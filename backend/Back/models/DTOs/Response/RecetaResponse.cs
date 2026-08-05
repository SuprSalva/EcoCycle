using System;

namespace Back.Models.DTOs.Response
{ 

    public class RecetaResponse
    {
        public string Id { get; set; } = null!;
        public string ProductoId { get; set; } = null!;
        public string NombreProducto { get; set; } = null!;
        public string? Descripcion { get; set; }
        public int Version { get; set; }
        public double TiempoEstimadoMinutos { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
