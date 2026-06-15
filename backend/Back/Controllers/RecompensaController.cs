using System.Security.Claims;
using Back.DTOs.Request;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecompensaController(Back.Repositories.Interfaces.IRecompensaRepository recompensaRepository, Back.Repositories.Interfaces.IUsuarioRepository usuarioRepository) : ControllerBase
{
    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> GetRecompensas()
    {
        var recompensas = await recompensaRepository.ObtenerActivasAsync();
        return Ok(ApiResponse<List<Recompensa>>.Ok(recompensas));
    }

    [HttpPost("canjear")]
    public async Task<IActionResult> Canjear([FromBody] CanjearRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var usuario = await usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        var recompensa = await recompensaRepository.ObtenerPorIdAsync(request.RecompensaId);
        if (recompensa == null || !recompensa.Activa) return NotFound(ApiResponse<object>.Fail("Recompensa no encontrada o inactiva."));

        if (recompensa.Stock == 0) return BadRequest(ApiResponse<object>.Fail("No hay stock disponible de esta recompensa."));

        if (usuario.SaldoPuntos < recompensa.CostoPuntos)
        {
            return BadRequest(ApiResponse<object>.Fail("Puntos insuficientes para este canje."));
        }

        // Aplicar el canje
        usuario.SaldoPuntos -= recompensa.CostoPuntos;

        if (recompensa.Stock > 0)
        {
            recompensa.Stock -= 1;
        }

        var canje = new Canje
        {
            UsuarioId = usuario.Id,
            RecompensaId = recompensa.Id,
            PuntosUsados = recompensa.CostoPuntos,
            Fecha = DateTime.UtcNow
        };

        // Guardar cambios
        await usuarioRepository.GuardarAsync(usuario);
        await recompensaRepository.GuardarAsync(recompensa);
        await recompensaRepository.RegistrarCanjeAsync(canje);

        return Ok(ApiResponse<object>.Ok(new { canjeId = canje.Id, nuevoSaldo = usuario.SaldoPuntos }, "Canje realizado correctamente."));
    }

    [HttpGet("admin")]
    public async Task<IActionResult> GetRecompensasAdmin()
    {
        var recompensas = await recompensaRepository.ObtenerTodasAsync();
        return Ok(ApiResponse<List<Recompensa>>.Ok(recompensas));
    }

    [HttpPost]
    public async Task<IActionResult> CrearRecompensa([FromBody] RecompensaRequest request)
    {
        var recompensa = new Recompensa
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            CostoPuntos = request.CostoPuntos,
            Stock = request.Stock,
            Activa = request.Activa,
            ImagenUrl = request.ImagenUrl
        };
        await recompensaRepository.GuardarAsync(recompensa);
        return Ok(ApiResponse<object>.Ok(null, "Recompensa creada correctamente."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarRecompensa(string id, [FromBody] RecompensaRequest request)
    {
        var recompensa = await recompensaRepository.ObtenerPorIdAsync(id);
        if (recompensa == null) return NotFound(ApiResponse<object>.Fail("Recompensa no encontrada."));

        recompensa.Nombre = request.Nombre;
        recompensa.Descripcion = request.Descripcion;
        recompensa.CostoPuntos = request.CostoPuntos;
        recompensa.Stock = request.Stock;
        recompensa.Activa = request.Activa;
        recompensa.ImagenUrl = request.ImagenUrl;

        await recompensaRepository.GuardarAsync(recompensa);
        return Ok(ApiResponse<object>.Ok(null, "Recompensa actualizada correctamente."));
    }

    [HttpPut("{id}/estatus")]
    public async Task<IActionResult> CambiarEstatusRecompensa(string id, [FromBody] CambiarEstatusRecompensaRequest request)
    {
        var recompensa = await recompensaRepository.ObtenerPorIdAsync(id);
        if (recompensa == null) return NotFound(ApiResponse<object>.Fail("Recompensa no encontrada."));

        recompensa.Activa = request.Activa;
        await recompensaRepository.GuardarAsync(recompensa);
        return Ok(ApiResponse<object>.Ok(null, "Estatus de la recompensa actualizado correctamente."));
    }
}
