using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.ViewModels.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Back.ViewModels;

public class AuthViewModel : IAuthViewModel
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ISaldoPuntosRepository _saldoPuntosRepository;
    private readonly IConfiguration _configuration;

    public AuthViewModel(
        IUsuarioRepository usuarioRepository,
        ISaldoPuntosRepository saldoPuntosRepository,
        IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _saldoPuntosRepository = saldoPuntosRepository;
        _configuration = configuration;
    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(request.Email);
        if (usuario == null || !usuario.Activo)
            return ApiResponse<LoginResponse>.Fail("Credenciales incorrectas");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            return ApiResponse<LoginResponse>.Fail("Credenciales incorrectas");

        var token = GenerateJwtToken(usuario);
        var saldo = await _saldoPuntosRepository.GetSaldoAsync(usuario.Id);

        var response = new LoginResponse
        {
            Token = token,
            Usuario = new UsuarioResponse
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellidos = usuario.Apellidos,
                Telefono = usuario.Telefono,
                Email = usuario.Email,
                Direccion = usuario.Direccion,
                Rol = usuario.Rol,
                Activo = usuario.Activo,
                PuntosDisponibles = saldo
            }
        };

        return ApiResponse<LoginResponse>.Success(response, "Login exitoso");
    }

    public async Task<ApiResponse<UsuarioResponse>> RegistroAsync(RegistroRequest request)
    {
        if (await _usuarioRepository.ExistsEmailAsync(request.Email))
            return ApiResponse<UsuarioResponse>.Fail("El email ya está registrado");

        var usuario = new Usuario
        {
            Id = request.Id ?? string.Empty,
            Nombre = request.Nombre,
            Apellidos = request.Apellidos,
            Telefono = request.Telefono,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Direccion = request.Direccion,
            Rol = "usuario",
            Activo = true
        };

        var id = await _usuarioRepository.CreateAsync(usuario);
        usuario.Id = id;

        await _saldoPuntosRepository.InitializeSaldoAsync(id);

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellidos = usuario.Apellidos,
            Telefono = usuario.Telefono,
            Email = usuario.Email,
            Direccion = usuario.Direccion,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            PuntosDisponibles = 0
        };

        return ApiResponse<UsuarioResponse>.Success(response, "Usuario registrado exitosamente");
    }

    private string GenerateJwtToken(Usuario usuario)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured");
        var key = Encoding.ASCII.GetBytes(jwtKey);
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "60");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Rol),
            new Claim("NombreCompleto", $"{usuario.Nombre} {usuario.Apellidos}")
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
