using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class ActualizarEstatusProductoRequest
    {
        [Required(ErrorMessage = "El Id del producto es requerido.")]
        public string Id { get; set; }

        [Required(ErrorMessage = "El estatus activo es requerido.")]
        public bool Activo { get; set; }
    }
}