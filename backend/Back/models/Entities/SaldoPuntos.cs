namespace Back.Models.Entities;

public class SaldoPuntos
{
    public int UsuarioId { get; set; }
    public decimal Saldo { get; set; }
    public DateTime ActualizadoEn { get; set; } = DateTime.UtcNow;
}