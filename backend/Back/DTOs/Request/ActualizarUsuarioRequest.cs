namespace Back.DTOs.Request;

public class ActualizarUsuarioRequest
{
     public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string? Rol { get; set; }
}
