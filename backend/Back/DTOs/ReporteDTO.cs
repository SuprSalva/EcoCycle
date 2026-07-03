namespace Back.DTOs{
    
    public class ReporteDto
    {
        public string Id { get; set; } = string.Empty;

        public string Nombre { get; set; } = string.Empty;

        public string Apellidos { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Telefono { get; set; } = string.Empty;

        public string Mensaje { get; set; } = string.Empty;

        public string Estado { get; set; } = string.Empty;

        public string? Respuesta { get; set; }

        public DateTime FechaEnvio { get; set; }
    }
}