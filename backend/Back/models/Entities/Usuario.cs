namespace Back.Models.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Direccion { get; set; }
    public string Rol { get; set; } = "usuario";
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;
}