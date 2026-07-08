using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
   public class CrearComentarioRequest
    {
        public string Email { get; set; }
        public string Mensaje { get; set; }
        public int Estrellas { get; set; } 
    }
}