using System.ComponentModel.DataAnnotations;

namespace Back.DTOs
{
    public class CrearRecetaDetalleRequest
    {
        [Required(ErrorMessage = "El RecetaId es obligatorio.")]
        public string RecetaId { get; set; } = null!;

        [Required(ErrorMessage = "El MateriaPrimaId es obligatorio.")]
        public string MateriaPrimaId { get; set; } = null!;

        [Required(ErrorMessage = "El NombreMateriaPrima es obligatorio.")]
        public string NombreMateriaPrima { get; set; } = null!;

        [Range(0.0001, double.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0.")]
        public double Cantidad { get; set; }

        [Required(ErrorMessage = "La unidad de medida es obligatoria.")]
        public string UnidadMedida { get; set; } = null!;

        public string? Observaciones { get; set; }
    }
}