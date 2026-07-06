// 📁 Back/Controllers/AuthController.cs
using System.Security.Claims;
using Back.DTOs.Request;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Services;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthController(
        IUsuarioRepository usuarioRepository,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(ApiResponse<object>.Fail("Email y contraseña son obligatorios."));
        }

        try
        {
            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(request.Email);
            
            if (usuario == null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no encontrado en el sistema."));
            }

            if (!usuario.Activo)
            {
                return Unauthorized(ApiResponse<object>.Fail("La cuenta está desactivada. Contacta al administrador."));
            }

            return Ok(ApiResponse<object>.Ok(new
            {
                Id = usuario.Id,
                Email = usuario.Email,
                Nombre = usuario.Nombre,
                Apellidos = usuario.Apellidos,
                Rol = usuario.Rol,
                Telefono = usuario.Telefono,
                Direccion = usuario.Direccion,
                SaldoPuntos = usuario.SaldoPuntos
            }, "Login exitoso."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail($"Error interno: {ex.Message}"));
        }
    }

    [HttpPost("registro")]
    [Authorize]
    public async Task<IActionResult> Registro([FromBody] RegistroRequest request)
    {
        // ✅ OBTENER EMAIL DEL TOKEN (NO DEL REQUEST)
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;
        var email = User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
        {
            return BadRequest(ApiResponse<object>.Fail("Token inválido o incompleto. Faltan claims de Firebase."));
        }

        var existente = await _usuarioRepository.ObtenerPorIdAsync(userId);
        if (existente != null)
        {
            return BadRequest(ApiResponse<object>.Fail("El usuario ya se encuentra registrado."));
        }

        var usuario = new Usuario
        {
            Id = userId,
            Email = email,  // ✅ EMAIL DEL TOKEN
            Nombre = request.Nombre,
            Apellidos = request.Apellidos,
            Telefono = request.Telefono ?? "",
            Direccion = request.Direccion ?? "",
            Rol = request.Rol ?? "cliente",
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            SaldoPuntos = 0
        };

        await _usuarioRepository.GuardarAsync(usuario);

        // ✅ ENVIAR CORREO CON LA CONTRASEÑA
        try
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:4200";
            var linkAcceso = $"{frontendUrl}/login";
            
            // ✅ USAR LA CONTRASEÑA DEL REQUEST
            await _emailService.EnviarBienvenidaAsync(
                email,  // ✅ EMAIL DEL TOKEN
                request.Nombre,
                request.Contrasena ?? "",  // ✅ CONTRASEÑA DEL REQUEST
                linkAcceso
            );
            
            Console.WriteLine($"✅ Correo de bienvenida enviado a {email}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Error al enviar correo: {ex.Message}");
        }

        return Ok(ApiResponse<object>.Ok(new 
        { 
            id = usuario.Id,
            rol = usuario.Rol 
        }, "Usuario registrado correctamente."));
    }
}