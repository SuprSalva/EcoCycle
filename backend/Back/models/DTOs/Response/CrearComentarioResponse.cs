namespace Back.Models.DTOs.Response
{
    public class CrearComentarioResponse
    {
        public bool Exito { get; set; }

        public string Mensaje { get; set; }

        public string? IdComentario { get; set; }
    }
}