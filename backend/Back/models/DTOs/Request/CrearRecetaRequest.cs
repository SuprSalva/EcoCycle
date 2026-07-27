using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class CrearRecetaRequest
    {
        [Required(ErrorMessage = "El ProductoId es obligatorio.")]
        public string ProductoId { get; set; } = null!;

        [Required(ErrorMessage = "El NombreProducto es obligatorio.")]
        public string NombreProducto { get; set; } = null!;

        public string? Descripcion { get; set; }

        public int Version { get; set; } = 1;

        [Range(0, double.MaxValue, ErrorMessage = "El TiempoEstimadoMinutos debe ser mayor o igual a 0.")]
        public double TiempoEstimadoMinutos { get; set; }

        public bool Activo { get; set; } = true;
    }
}