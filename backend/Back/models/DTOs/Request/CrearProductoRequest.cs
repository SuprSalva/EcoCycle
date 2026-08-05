using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class CrearProductoRequest
    {
        [Required(ErrorMessage = "El nombre del producto es requerido.")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres.")]
        public string Nombre { get; set; }

        public string Descripcion { get; set; }

        public bool Activo { get; set; } = true;

    }
}