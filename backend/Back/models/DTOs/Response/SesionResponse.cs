namespace Back.Models.DTOs.Response;

public class SesionResponse
{
    public int Id { get; set; }
    public int Botellas { get; set; }
    public decimal Puntos { get; set; }
    public DateTime Fecha { get; set; }
    public string MaquinaId { get; set; } = string.Empty;
}