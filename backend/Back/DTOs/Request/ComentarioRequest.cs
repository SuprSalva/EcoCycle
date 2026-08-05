namespace Back.Models.DTOs.Request;

public class ComentarioRequest
{
    public string Asunto { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
    public string Categoria { get; set; } = "Sugerencia";
}