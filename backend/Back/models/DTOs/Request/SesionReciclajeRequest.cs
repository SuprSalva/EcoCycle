namespace Back.Models.DTOs.Request;

public class SesionReciclajeRequest
{
    public string MaquinaId { get; set; } = string.Empty;
    public int Botellas { get; set; }
}