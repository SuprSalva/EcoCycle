namespace Back.Models.DTOs.Response;

public class UsuarioResponse
{
    public string Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string Rol { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public double PuntosDisponibles { get; set; }
}
