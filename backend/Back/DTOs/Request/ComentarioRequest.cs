namespace Back.Models.DTOs.Request;

public class ComentarioRequest
{
    public string Id { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public string Categoria { get; set; } = "Sugerencia";
    public string Email { get; set; } = string.Empty;
    public string Estatus { get; set; } = "Recibido";
    public object Fecha { get; set; } // Puede ser string o Timestamp
}