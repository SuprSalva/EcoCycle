namespace Back.DTOs.Request
{
    public class CrearReporteRequest
    {
        public string Nombre { get; set; } = string.Empty;

        public string Apellidos { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Telefono { get; set; } = string.Empty;

        public string Mensaje { get; set; } = string.Empty;
    }
}