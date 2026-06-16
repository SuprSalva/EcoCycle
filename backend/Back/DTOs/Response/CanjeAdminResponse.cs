namespace Back.DTOs.Response;

public class CanjeAdminResponse
{
    public string Id { get; set; } = string.Empty;
    public string UsuarioId { get; set; } = string.Empty;
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioEmail { get; set; } = string.Empty;
    public string RecompensaId { get; set; } = string.Empty;
    public string RecompensaNombre { get; set; } = string.Empty;
    public double PuntosUsados { get; set; }
    public DateTime Fecha { get; set; }
}
