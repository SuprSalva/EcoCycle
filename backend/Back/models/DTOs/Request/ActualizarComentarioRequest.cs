using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class ActualizarComentarioRequest
    {
        public string Id { get; set; }
        public string Mensaje { get; set; }
        public int Estrellas { get; set; }
        public string Estatus { get; set; }
        public bool EsPublico { get; set; }
    }
}