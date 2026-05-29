namespace Back.Models.DTOs.Response;

public class SesionResponse
{
    public string Id { get; set; }
    public int Botellas { get; set; }
    public double Puntos { get; set; }
    public DateTime Fecha { get; set; }
    public string MaquinaId { get; set; } = string.Empty;
}
