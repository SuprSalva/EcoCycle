namespace Back.DTOs.Request;

public class SesionReciclajeRequest
{
    public string UsuarioId { get; set; } = string.Empty;
    public string MaquinaId { get; set; } = string.Empty;
    public int Botellas { get; set; }
}
