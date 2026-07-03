namespace Back.DTOs.Request;

public class RegistroRequest
{
      public string Nombre { get; set; }
    public string Apellidos { get; set; }
    public string Telefono { get; set; }
    public string Direccion { get; set; }
    public string? Rol { get; set; }
}
