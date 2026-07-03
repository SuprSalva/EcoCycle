namespace Back.DTOs.Response;

public class CanjeUsuarioResponse
{
    public string Id { get; set; } = string.Empty;
    public string CodigoCanje { get; set; } = string.Empty;
    public string RecompensaId { get; set; } = string.Empty;
    public string RecompensaNombre { get; set; } = string.Empty;
    public string? RecompensaImagenUrl { get; set; }
    public double PuntosUsados { get; set; }
    public DateTime Fecha { get; set; }
    public bool Reclamado { get; set; }
    public DateTime? FechaReclamado { get; set; }
}
