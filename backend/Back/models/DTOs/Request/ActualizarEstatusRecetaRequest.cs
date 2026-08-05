using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class ActualizarEstatusRecetaRequest
    {
        [Required]
        public bool Activo { get; set; }
    }
}