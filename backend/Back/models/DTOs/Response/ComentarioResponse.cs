using System;

namespace Back.Models.DTOs.Response
{
   public class ComentarioResponse
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Mensaje { get; set; }
        public int Estrellas { get; set; }
        public string Estatus { get; set; }
        public bool EsPublico { get; set; }
        public DateTime Fecha { get; set; }
    }
}