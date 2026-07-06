namespace Back.DTOs.Request;

public class RegistroRequest
{ public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string? Rol { get; set; }
    public string? Contrasena { get; set; }
}
