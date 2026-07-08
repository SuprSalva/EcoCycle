namespace Back.DTOs.Response;

public class UsuarioResponse
{
 public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public double SaldoPuntos { get; set; }
    public bool Activo { get; set; } = true;
    public string? AvatarUrl { get; set; }
    public DateTime CreadoEn { get; set; }
}
