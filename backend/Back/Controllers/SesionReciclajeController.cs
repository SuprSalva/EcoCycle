using System.Security.Claims;
using Back.DTOs.Request;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SesionReciclajeController(ISesionReciclajeRepository sesionRepository, IUsuarioRepository usuarioRepository) : ControllerBase
{
    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value ?? string.Empty;

    [HttpPost]
    // NOTA: Para la máquina IoT podrías requerir API Key en lugar de un JWT en el futuro.
    public async Task<IActionResult> RegistrarSesion([FromBody] SesionReciclajeRequest request)
    {
        if (request.Botellas <= 0) return BadRequest(ApiResponse<object>.Fail("La cantidad de botellas debe ser mayor a 0."));

        var sesion = new SesionReciclaje
        {
            UsuarioId = request.UsuarioId,
            MaquinaId = request.MaquinaId,
            Botellas = request.Botellas,
            Puntos = request.Botellas * 0.10, // 0.10 puntos por botella
            Fecha = DateTime.UtcNow
        };

        await sesionRepository.GuardarAsync(sesion);

        // Actualizar la colección de puntos del usuario
        var usuario = await usuarioRepository.ObtenerPorIdAsync(request.UsuarioId);
        if (usuario != null)
        {
            usuario.SaldoPuntos += sesion.Puntos;
            await usuarioRepository.GuardarAsync(usuario);
        }

        return Ok(ApiResponse<object>.Ok(new { id = sesion.Id, puntos = sesion.Puntos }, "Sesión registrada correctamente."));
    }

    // El historial unificado ahora se encuentra en UsuarioController.
}
