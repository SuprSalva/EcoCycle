namespace Back.Entities;

public class SesionReciclaje
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string MaquinaId { get; set; } = string.Empty;
    public int Botellas { get; set; }
    public decimal Puntos { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}