using System.Security.Claims;
using Back.DTOs.Request;
using Back.DTOs.Response;
using Back.Repositories.Interfaces;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuarioController(Back.Repositories.Interfaces.IUsuarioRepository usuarioRepository, ISesionReciclajeRepository sesionRepository, Back.Repositories.Interfaces.IRecompensaRepository recompensaRepository) : ControllerBase
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
            SaldoPuntos = (double)usuario.SaldoPuntos
        };

        return Ok(ApiResponse<UsuarioResponse>.Ok(response));
    }

    [HttpGet("historial")]
    public async Task<IActionResult> GetHistorial()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var sesiones = await sesionRepository.ObtenerPorUsuarioAsync(userId);
        var canjes = await recompensaRepository.ObtenerCanjesPorUsuarioAsync(userId);

        var historial = new List<HistorialItemResponse>();

        foreach (var sesion in sesiones)
        {
            historial.Add(new HistorialItemResponse
            {
                Id = sesion.Id,
                Titulo = $"{sesion.Botellas} botellas",
                Subtitulo = $"{sesion.Fecha:dd MMM yyyy} • Reciclaje",
                Puntos = $"+{sesion.Puntos} pts",
                EsPositivo = true,
                Fecha = sesion.Fecha
            });
        }

        foreach (var canje in canjes)
        {
            var recompensa = await recompensaRepository.ObtenerPorIdAsync(canje.RecompensaId);
            var titulo = recompensa != null ? recompensa.Nombre : "Premio Canjeado";

            historial.Add(new HistorialItemResponse
            {
                Id = canje.Id,
                Titulo = titulo,
                Subtitulo = $"{canje.Fecha:dd MMM yyyy} • Canje",
                Puntos = $"-{canje.PuntosUsados} pts",
                EsPositivo = false,
                Fecha = canje.Fecha
            });
        }

        var historialOrdenado = historial.OrderByDescending(h => h.Fecha).ToList();

        return Ok(ApiResponse<List<HistorialItemResponse>>.Ok(historialOrdenado));
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
            SaldoPuntos = (double)u.SaldoPuntos
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
            SaldoPuntos = (double)usuario.SaldoPuntos
        };

        return Ok(ApiResponse<UsuarioResponse>.Ok(response));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarUsuarioDesdeAdmin(string id, [FromBody] ActualizarUsuarioRequest request)
    {
        var usuario = await usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        usuario.Nombre = request.Nombre;
        usuario.Apellidos = request.Apellidos;
        usuario.Telefono = request.Telefono;
        usuario.Direccion = request.Direccion;
        if (!string.IsNullOrEmpty(request.Rol))
        {
            usuario.Rol = request.Rol;
        }

        await usuarioRepository.GuardarAsync(usuario);

        return Ok(ApiResponse<object>.Ok(null, "Usuario actualizado correctamente por el administrador."));
    }

    [HttpPut("{id}/estatus")]
    public async Task<IActionResult> CambiarEstatus(string id, [FromBody] CambiarEstatusRequest request)
    {
        var usuario = await usuarioRepository.ObtenerPorIdAsync(id);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        if (!string.IsNullOrEmpty(request.Rol))
        {
            usuario.Rol = request.Rol;
            await usuarioRepository.GuardarAsync(usuario);
        }

        return Ok(ApiResponse<object>.Ok(null, "Estatus del usuario actualizado correctamente."));
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
