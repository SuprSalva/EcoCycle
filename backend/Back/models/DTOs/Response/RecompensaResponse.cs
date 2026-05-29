namespace Back.Models.DTOs.Response;

public class RecompensaResponse
{
    public string Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public double CostoPuntos { get; set; }
    public int Stock { get; set; }
    public bool Activa { get; set; }
}
