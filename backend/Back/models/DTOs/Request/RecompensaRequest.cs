namespace Back.Models.DTOs.Request;

public class RecompensaRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public double CostoPuntos { get; set; }
    public int Stock { get; set; }
    public bool Activa { get; set; } = true;
}
