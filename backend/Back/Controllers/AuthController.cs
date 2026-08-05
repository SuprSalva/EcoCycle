// 📁 Back/Controllers/AuthController.cs
using System.Security.Claims;
using Back.DTOs.Request;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Services;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Roles que un usuario puede auto-asignarse al registrarse.
    // Cualquier otro (p. ej. "admin") se fuerza a "cliente" para evitar escalada de privilegios.
    private static readonly HashSet<string> RolesAutoRegistro = new(StringComparer.OrdinalIgnoreCase)
    {
        "cliente",
        "usuario"
    };

    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IEmailService _emailService;
    private readonly IFirebaseAuthService _firebaseAuthService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IUsuarioRepository usuarioRepository,
        IEmailService emailService,
        IFirebaseAuthService firebaseAuthService,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _usuarioRepository = usuarioRepository;
        _emailService = emailService;
        _firebaseAuthService = firebaseAuthService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(ApiResponse<object>.Fail("Email y contraseña son obligatorios."));
        }

        try
        {
            // Verificación real de credenciales contra Firebase Authentication.
            // Antes este endpoint devolvía el perfil con solo conocer el email.
            var credencialesValidas = await _firebaseAuthService.VerificarCredencialesAsync(request.Email, request.Password);
            if (!credencialesValidas)
            {
                return Unauthorized(ApiResponse<object>.Fail("Credenciales inválidas."));
            }

            var usuario = await _usuarioRepository.ObtenerPorEmailAsync(request.Email);
            if (usuario == null)
            {
                // Mensaje genérico: no revelar si la cuenta existe o no.
                return Unauthorized(ApiResponse<object>.Fail("Credenciales inválidas."));
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
            _logger.LogError(ex, "Error en login para {Email}", request.Email);
            return StatusCode(500, ApiResponse<object>.Fail("Error interno. Intente más tarde."));
        }
    }

    [HttpPost("registro")]
    [Authorize]
    public async Task<IActionResult> Registro([FromBody] RegistroRequest request)
    {
        // El email y el id vienen SIEMPRE del token de Firebase, nunca del body.
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

        var rolSolicitado = request.Rol ?? "cliente";
        if (!RolesAutoRegistro.Contains(rolSolicitado))
        {
            _logger.LogWarning("Registro de {Email} intentó rol '{Rol}'; se fuerza a 'cliente'.", email, rolSolicitado);
            rolSolicitado = "cliente";
        }

        var usuario = new Usuario
        {
            Id = userId,
            Email = email,
            Nombre = request.Nombre,
            Apellidos = request.Apellidos,
            Telefono = request.Telefono ?? "",
            Direccion = request.Direccion ?? "",
            Rol = rolSolicitado,
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            SaldoPuntos = 0
        };

        await _usuarioRepository.GuardarAsync(usuario);

        // Correo de bienvenida SIN la contraseña (nunca enviar contraseñas en texto plano).
        try
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:4200";
            var linkAcceso = $"{frontendUrl}/login";

            await _emailService.EnviarBienvenidaAsync(email, request.Nombre, string.Empty, linkAcceso);
            _logger.LogInformation("Correo de bienvenida enviado a {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo enviar el correo de bienvenida a {Email}", email);
        }

        return Ok(ApiResponse<object>.Ok(new
        {
            id = usuario.Id,
            rol = usuario.Rol
        }, "Usuario registrado correctamente."));
    }
}
