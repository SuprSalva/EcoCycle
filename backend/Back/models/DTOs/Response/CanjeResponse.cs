namespace Back.Models.DTOs.Response;

public class CanjeResponse
{
    public string Id { get; set; }
    public string RecompensaId { get; set; }
    public string RecompensaNombre { get; set; } = string.Empty;
    public double PuntosUsados { get; set; }
    public DateTime Fecha { get; set; }
}
