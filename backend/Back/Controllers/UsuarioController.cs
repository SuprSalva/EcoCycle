using System.Security.Claims;
using System.Security.Cryptography;
using Back.Auth;
using Back.DTOs.Request;
using Back.DTOs.Response;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Services;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ISesionReciclajeRepository _sesionRepository;
    private readonly IRecompensaRepository _recompensaRepository;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UsuarioController> _logger;

    public UsuarioController(
        IUsuarioRepository usuarioRepository,
        ISesionReciclajeRepository sesionRepository,
        IRecompensaRepository recompensaRepository,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<UsuarioController> logger)
    {
        _usuarioRepository = usuarioRepository;
        _sesionRepository = sesionRepository;
        _recompensaRepository = recompensaRepository;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    private string GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
        User.FindFirst("user_id")?.Value ??
        string.Empty;

    [HttpPost("crear-cliente")]
    [AdminOnly]
    public async Task<IActionResult> CrearCliente([FromBody] CrearClienteRequest request)
    {
        try
        {
            var existente = await _usuarioRepository.ObtenerPorEmailAsync(request.Email);
            if (existente != null)
                return BadRequest(ApiResponse<object>.Fail("El email ya está registrado."));

            var passwordTemporal = GenerarPasswordTemporal();

            var usuario = new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                Nombre = request.Nombre,
                Apellidos = request.Apellidos,
                Telefono = request.Telefono ?? "",
                Direccion = request.Direccion ?? "",
                Rol = "cliente",
                Activo = true,
                CreadoEn = DateTime.UtcNow,
                SaldoPuntos = 0
            };

            await _usuarioRepository.GuardarAsync(usuario);
            _logger.LogInformation("Cliente creado por admin: {UsuarioId}", usuario.Id);

            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:4200";
            var linkAcceso = $"{frontendUrl}/login";

            var enviado = await _emailService.EnviarCredencialesClienteAsync(
                request.Email,
                request.Nombre,
                passwordTemporal,
                linkAcceso
            );

            if (!enviado)
            {
                _logger.LogWarning("No se pudo enviar el correo de credenciales a {Email}", request.Email);
            }

            return Ok(ApiResponse<object>.Ok(new
            {
                usuario.Id,
                usuario.Email,
                usuario.Nombre,
                usuario.Apellidos,
                usuario.Rol,
                CorreoEnviado = enviado
            }, "Cliente creado exitosamente."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear cliente");
            return StatusCode(500, ApiResponse<object>.Fail("Error al crear el cliente. Intente más tarde."));
        }
    }

    private static string GenerarPasswordTemporal()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        var bytes = RandomNumberGenerator.GetBytes(12);
        return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
    }

    [HttpGet("perfil")]
    public async Task<IActionResult> GetPerfil()
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));
            }

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            if (usuario == null)
            {
                return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));
            }

            var response = new UsuarioResponse
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Apellidos = usuario.Apellidos,
                Email = usuario.Email,
                Telefono = usuario.Telefono,
                Direccion = usuario.Direccion,
                Rol = usuario.Rol,
                SaldoPuntos = (double)usuario.SaldoPuntos,
                Activo = usuario.Activo,
                AvatarUrl = usuario.AvatarUrl,
                CreadoEn = usuario.CreadoEn
            };

            return Ok(ApiResponse<UsuarioResponse>.Ok(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en GetPerfil");
            return StatusCode(500, ApiResponse<object>.Fail("Error interno. Intente más tarde."));
        }
    }

    [HttpGet("historial")]
    public async Task<IActionResult> GetHistorial()
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var sesiones = await _sesionRepository.ObtenerPorUsuarioAsync(userId);
            var canjes = await _recompensaRepository.ObtenerCanjesPorUsuarioAsync(userId);
            var recompensasTodas = await _recompensaRepository.ObtenerTodasAsync();

            var historial = new List<HistorialItemResponse>();

            foreach (var s in sesiones)
            {
                historial.Add(new HistorialItemResponse
                {
                    Id = s.Id,
                    Titulo = "Sesión de Reciclaje",
                    Subtitulo = $"{s.Botellas} botellas en {s.MaquinaId}",
                    Puntos = $"+{s.Puntos}",
                    EsPositivo = true,
                    Fecha = s.Fecha
                });
            }

            foreach (var c in canjes)
            {
                var r = recompensasTodas.FirstOrDefault(x => x.Id == c.RecompensaId);
                historial.Add(new HistorialItemResponse
                {
                    Id = c.Id,
                    Titulo = "Canje de Recompensa",
                    Subtitulo = r?.Nombre ?? "Recompensa",
                    Puntos = $"-{c.PuntosUsados}",
                    EsPositivo = false,
                    Fecha = c.Fecha
                });
            }

            historial = historial.OrderByDescending(x => x.Fecha).ToList();

            return Ok(ApiResponse<List<HistorialItemResponse>>.Ok(historial));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en GetHistorial");
            return StatusCode(500, ApiResponse<object>.Fail("Error interno. Intente más tarde."));
        }
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            if (usuario == null)
                return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

            if (!string.IsNullOrEmpty(request.Nombre))
                usuario.Nombre = request.Nombre;

            if (!string.IsNullOrEmpty(request.Apellidos))
                usuario.Apellidos = request.Apellidos;

            if (!string.IsNullOrEmpty(request.Telefono))
                usuario.Telefono = request.Telefono;

            if (request.Direccion != null)
                usuario.Direccion = request.Direccion;

            if (request.AvatarUrl != null)
                usuario.AvatarUrl = request.AvatarUrl;

            await _usuarioRepository.GuardarAsync(usuario);

            return Ok(ApiResponse<object>.Ok(null, "Perfil actualizado correctamente."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en ActualizarPerfil");
            return StatusCode(500, ApiResponse<object>.Fail("Error interno. Intente más tarde."));
        }
    }

    [HttpGet("todos")]
    [AdminOnly]
    public async Task<IActionResult> ObtenerTodos()
    {
        var usuarios = await _usuarioRepository.ObtenerTodosAsync();
        var response = usuarios.Select(u => new UsuarioResponse
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Apellidos = u.Apellidos,
            Email = u.Email,
            Telefono = u.Telefono,
            Direccion = u.Direccion,
            Rol = u.Rol,
            SaldoPuntos = (double)u.SaldoPuntos,
            Activo = u.Activo,
            AvatarUrl = u.AvatarUrl
        }).ToList();

        return Ok(ApiResponse<List<UsuarioResponse>>.Ok(response));
    }

    [HttpGet("{id}")]
    [AdminOnly]
    public async Task<IActionResult> ObtenerPorId(string id)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null)
            return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellidos = usuario.Apellidos,
            Email = usuario.Email,
            Telefono = usuario.Telefono,
            Direccion = usuario.Direccion,
            Rol = usuario.Rol,
            SaldoPuntos = (double)usuario.SaldoPuntos,
            Activo = usuario.Activo,
            AvatarUrl = usuario.AvatarUrl
        };

        return Ok(ApiResponse<UsuarioResponse>.Ok(response));
    }

    [HttpPut("{id}")]
    [AdminOnly]
    public async Task<IActionResult> ActualizarUsuario(string id, [FromBody] ActualizarUsuarioRequest request)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null)
            return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        if (!string.IsNullOrEmpty(request.Nombre))
            usuario.Nombre = request.Nombre;

        if (!string.IsNullOrEmpty(request.Apellidos))
            usuario.Apellidos = request.Apellidos;

        if (!string.IsNullOrEmpty(request.Telefono))
            usuario.Telefono = request.Telefono;

        if (request.Direccion != null)
            usuario.Direccion = request.Direccion;

        if (!string.IsNullOrEmpty(request.Rol))
            usuario.Rol = request.Rol;

        if (request.AvatarUrl != null)
            usuario.AvatarUrl = request.AvatarUrl;

        await _usuarioRepository.GuardarAsync(usuario);

        return Ok(ApiResponse<object>.Ok(null, "Usuario actualizado correctamente."));
    }

    [HttpDelete("{id}")]
    [AdminOnly]
    public async Task<IActionResult> Eliminar(string id)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null)
            return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        await _usuarioRepository.EliminarAsync(id);
        _logger.LogInformation("Usuario {UsuarioId} eliminado por {AdminId}", id, GetUserId());

        return Ok(ApiResponse<object>.Ok(null, "Usuario eliminado correctamente."));
    }
}
