namespace Back.Models.DTOs.Response;

public class NotificacionResponse
{
    public string Id { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Icono { get; set; } = string.Empty;
    public bool Leida { get; set; }
    public DateTime Fecha { get; set; }
}
