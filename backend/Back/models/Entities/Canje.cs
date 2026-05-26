namespace Back.Models.Entities;

public class Canje
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int RecompensaId { get; set; }
    public decimal PuntosUsados { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}