using System.Security.Claims;
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

    public UsuarioController(
        IUsuarioRepository usuarioRepository,
        ISesionReciclajeRepository sesionRepository,
        IRecompensaRepository recompensaRepository,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _usuarioRepository = usuarioRepository;
        _sesionRepository = sesionRepository;
        _recompensaRepository = recompensaRepository;
        _emailService = emailService;
        _configuration = configuration;
    }

    private string GetUserId() => 
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
        User.FindFirst("user_id")?.Value ?? 
        string.Empty;

   
    [HttpPost("crear-cliente")]
    public async Task<IActionResult> CrearCliente([FromBody] CrearClienteRequest request)
    {
        try
        {
            Console.WriteLine($"Intentando crear cliente: {request.Email}");

            var adminId = GetUserId();
            var admin = await _usuarioRepository.ObtenerPorIdAsync(adminId);
            if (admin?.Rol?.ToLower() != "admin")
                return Forbid("Acceso denegado. Solo administradores.");

            var existente = await _usuarioRepository.ObtenerPorEmailAsync(request.Email);
            if (existente != null)
                return BadRequest(ApiResponse<object>.Fail("El email ya está registrado."));

            var passwordTemporal = GenerarPasswordTemporal();
            Console.WriteLine($"Contraseña generada: {passwordTemporal}");

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
            Console.WriteLine($"Usuario guardado en Firestore: {usuario.Id}");

           
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:4200";
            var linkAcceso = $"{frontendUrl}/login";

            Console.WriteLine($" Enviando correo a {request.Email}...");
            var enviado = await _emailService.EnviarCredencialesClienteAsync(
                request.Email,
                request.Nombre,
                passwordTemporal,
                linkAcceso
            );

            if (enviado)
            {
                Console.WriteLine($"Correo enviado exitosamente a {request.Email}");
            }
            else
            {
                Console.WriteLine($"No se pudo enviar el correo a {request.Email}");
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
            Console.WriteLine($"❌ Error al crear cliente: {ex.Message}");
            return StatusCode(500, ApiResponse<object>.Fail($"Error al crear cliente: {ex.Message}"));
        }
    }

    private string GenerarPasswordTemporal()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 10)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    [HttpGet("perfil")]
    public async Task<IActionResult> GetPerfil()
    {
        try
        {
            Console.WriteLine($"🔍 Obteniendo perfil del usuario...");
            
            var userId = GetUserId();
            Console.WriteLine($"🔍 UserId obtenido: '{userId}'");
            
            if (string.IsNullOrEmpty(userId)) 
            {
                Console.WriteLine($"❌ UserId vacío");
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));
            }

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            
            if (usuario == null) 
            {
                Console.WriteLine($"❌ Usuario no encontrado en Firestore para ID: {userId}");
                return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));
            }

            Console.WriteLine($"✅ Perfil encontrado: {usuario.Email}, Rol: {usuario.Rol}");

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
                Activo = usuario.Activo
            };

            return Ok(ApiResponse<UsuarioResponse>.Ok(response));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en GetPerfil: {ex.Message}");
            return StatusCode(500, ApiResponse<object>.Fail($"Error interno: {ex.Message}"));
        }
    }

    [HttpGet("historial")]
    public async Task<IActionResult> GetHistorial()
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var sesiones = await _sesionRepository.ObtenerPorUsuarioAsync(userId);
            var canjes = await _recompensaRepository.ObtenerCanjesPorUsuarioAsync(userId);

            var historial = new List<(DateTime Fecha, object Item)>();

            foreach (var sesion in sesiones)
            {
                historial.Add((sesion.Fecha, new
                {
                    id = sesion.Id,
                    titulo = "Reciclaje",
                    subtitulo = $"{sesion.Botellas} botella(s) registrada(s)",
                    puntos = $"+{sesion.Puntos.ToString("0.##")} pts",
                    esPositivo = true,
                    fecha = sesion.Fecha
                }));
            }

            foreach (var canje in canjes)
            {
                var recompensa = await _recompensaRepository.ObtenerPorIdAsync(canje.RecompensaId);
                historial.Add((canje.Fecha, new
                {
                    id = canje.Id,
                    titulo = "Canje de recompensa",
                    subtitulo = recompensa?.Nombre ?? "Recompensa",
                    puntos = $"-{canje.PuntosUsados.ToString("0.##")}",
                    esPositivo = false,
                    fecha = canje.Fecha
                }));
            }

            var ordenado = historial
                .OrderByDescending(h => h.Fecha)
                .Select(h => h.Item)
                .ToList();

            return Ok(ApiResponse<object>.Ok(ordenado));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en GetHistorial: {ex.Message}");
            return StatusCode(500, ApiResponse<object>.Fail($"Error interno: {ex.Message}"));
        }
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

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
            if (!string.IsNullOrEmpty(request.AvatarUrl))
                usuario.AvatarUrl = request.AvatarUrl;

            await _usuarioRepository.GuardarAsync(usuario);

            return Ok(ApiResponse<object>.Ok(null, "Perfil actualizado correctamente."));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en ActualizarPerfil: {ex.Message}");
            return StatusCode(500, ApiResponse<object>.Fail($"Error interno: {ex.Message}"));
        }
    }

    [HttpGet("todos")]
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
            Activo = u.Activo
        }).ToList();

        return Ok(ApiResponse<List<UsuarioResponse>>.Ok(response));
    }

    [HttpGet("{id}")]
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
            Activo = usuario.Activo
        };

        return Ok(ApiResponse<UsuarioResponse>.Ok(response));
    }

    [HttpPut("{id}")]
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

        await _usuarioRepository.GuardarAsync(usuario);

        return Ok(ApiResponse<object>.Ok(null, "Usuario actualizado correctamente."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(string id)
    {
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null) 
            return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        await _usuarioRepository.EliminarAsync(id);

        return Ok(ApiResponse<object>.Ok(null, "Usuario eliminado correctamente."));
    }
}

