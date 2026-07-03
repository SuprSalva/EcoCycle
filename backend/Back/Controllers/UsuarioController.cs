// 📁 Back/Controllers/UsuarioController.cs
using System.Security.Claims;
using Back.DTOs.Request;
using Back.DTOs.Response;
using Back.Repositories.Interfaces;
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

    public UsuarioController(
        IUsuarioRepository usuarioRepository,
        ISesionReciclajeRepository sesionRepository,
        IRecompensaRepository recompensaRepository)
    {
        _usuarioRepository = usuarioRepository;
        _sesionRepository = sesionRepository;
        _recompensaRepository = recompensaRepository;
    }

    private string GetUserId() => 
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
        User.FindFirst("user_id")?.Value ?? 
        string.Empty;

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