namespace Back.Models.DTOs.Response;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public UsuarioResponse Usuario { get; set; } = new();
}