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
public class UsuarioController(IUsuarioRepository usuarioRepository) : ControllerBase
{
    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value ?? string.Empty;

    [HttpGet("perfil")]
    public async Task<IActionResult> GetPerfil()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var usuario = await usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellidos = usuario.Apellidos,
            Email = usuario.Email,
            Telefono = usuario.Telefono,
            Direccion = usuario.Direccion,
            Rol = usuario.Rol,
            SaldoPuntos = (decimal)usuario.SaldoPuntos
        };

        return Ok(ApiResponse<UsuarioResponse>.Ok(response));
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> UpdatePerfil([FromBody] ActualizarPerfilRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var usuario = await usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        usuario.Nombre = request.Nombre;
        usuario.Apellidos = request.Apellidos;
        usuario.Telefono = request.Telefono;
        usuario.Direccion = request.Direccion;

        await usuarioRepository.GuardarAsync(usuario);

        return Ok(ApiResponse<object>.Ok(null, "Perfil actualizado correctamente."));
    }

    [HttpGet("puntos")]
    public async Task<IActionResult> GetPuntos()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var usuario = await usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        return Ok(ApiResponse<object>.Ok(new { saldo = usuario.SaldoPuntos }));
    }

    // --- Métodos CRUD Completos ---

    [HttpGet("todos")]
    public async Task<IActionResult> ObtenerTodos()
    {
        var usuarios = await usuarioRepository.ObtenerTodosAsync();
        var response = usuarios.Select(u => new UsuarioResponse
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Apellidos = u.Apellidos,
            Email = u.Email,
            Telefono = u.Telefono,
            Direccion = u.Direccion,
            Rol = u.Rol,
            SaldoPuntos = (decimal)u.SaldoPuntos
        }).ToList();

        return Ok(ApiResponse<List<UsuarioResponse>>.Ok(response));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(string id)
    {
        var usuario = await usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellidos = usuario.Apellidos,
            Email = usuario.Email,
            Telefono = usuario.Telefono,
            Direccion = usuario.Direccion,
            Rol = usuario.Rol,
            SaldoPuntos = (decimal)usuario.SaldoPuntos
        };

        return Ok(ApiResponse<UsuarioResponse>.Ok(response));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(string id)
    {
        var usuario = await usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        await usuarioRepository.EliminarAsync(id);

        return Ok(ApiResponse<object>.Ok(null, "Usuario eliminado correctamente."));
    }
}
