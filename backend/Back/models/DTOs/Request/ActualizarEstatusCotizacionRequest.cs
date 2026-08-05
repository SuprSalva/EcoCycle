using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class ActualizarEstatusCotizacionRequest
    {
        [Required(ErrorMessage = "El Id de la cotización es requerido.")]
        public string Id { get; set; }

        [Required(ErrorMessage = "El nuevo estatus es requerido.")]
        public string Estatus { get; set; }
    }
}