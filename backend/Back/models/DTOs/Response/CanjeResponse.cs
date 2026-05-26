namespace Back.Models.DTOs.Response;

public class CanjeResponse
{
    public int Id { get; set; }
    public int RecompensaId { get; set; }
    public string RecompensaNombre { get; set; } = string.Empty;
    public decimal PuntosUsados { get; set; }
    public DateTime Fecha { get; set; }
}