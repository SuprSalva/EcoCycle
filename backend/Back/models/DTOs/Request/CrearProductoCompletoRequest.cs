using System.Collections.Generic;

namespace Back.Models.DTOs.Request
{
    public class CrearProductoCompletoRequest
    {
        // --- Datos del Producto ---
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;

        // --- Datos de la Receta ---
        public double TiempoEstimadoMinutos { get; set; }

        // --- Lista de Insumos (Detalles de la Receta) ---
        public List<DetalleRecetaInput> Insumos { get; set; } = new();
    }

    public class DetalleRecetaInput
    {
        public string MateriaPrimaId { get; set; } = string.Empty;
        public string NombreMateriaPrima { get; set; } = string.Empty;
        public double Cantidad { get; set; }
        public string UnidadMedida { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }
}