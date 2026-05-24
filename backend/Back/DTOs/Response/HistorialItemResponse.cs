namespace Back.DTOs.Response;

public class HistorialItemResponse
{
    public string Id { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Subtitulo { get; set; } = string.Empty;
    public string Puntos { get; set; } = string.Empty;
    public bool EsPositivo { get; set; }
    public DateTime Fecha { get; set; }
}
