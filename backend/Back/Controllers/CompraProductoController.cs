using System.Security.Claims;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CompraProductoController(ICompraProductoRepository compraProductoRepository) : ControllerBase
{
    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value ?? string.Empty;

    [HttpGet("mis-compras")]
    public async Task<IActionResult> ObtenerMisCompras()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var compras = await compraProductoRepository.ObtenerPorUsuarioIdAsync(userId);
        return Ok(ApiResponse<List<CompraProducto>>.Ok(compras));
    }

    [HttpPost]
    public async Task<IActionResult> RegistrarCompra([FromBody] CompraProducto compra)
    {
        // En un caso real esto se conectaría a un sistema de pagos o carritos.
        // Aquí simulamos que un admin o sistema asigna una compra al usuario.
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        if (string.IsNullOrEmpty(compra.UsuarioId))
        {
            compra.UsuarioId = userId; // Por defecto asignarla al usuario logueado si no viene.
        }

        compra.Id = string.Empty;
        compra.FechaCompra = DateTime.UtcNow;
        await compraProductoRepository.GuardarAsync(compra);
        return Ok(ApiResponse<CompraProducto>.Ok(compra, "Compra registrada exitosamente."));
    }

    [HttpPut("{id}/opinion")]
    public async Task<IActionResult> DejarOpinion(string id, [FromBody] CompraProducto opinionActualizada)
    {
        if (opinionActualizada.Calificacion < 1 || opinionActualizada.Calificacion > 5)
            return BadRequest(ApiResponse<object>.Fail("La calificación debe estar entre 1 y 5 estrellas."));

        if (string.IsNullOrWhiteSpace(opinionActualizada.Opinion))
            return BadRequest(ApiResponse<object>.Fail("La opinión no puede estar vacía."));

        var compra = await compraProductoRepository.ObtenerPorIdAsync(id);
        if (compra == null) return NotFound(ApiResponse<object>.Fail("Compra no encontrada."));

        var userId = GetUserId();
        if (compra.UsuarioId != userId) return Forbid(); // Solo el dueño puede opinar

        compra.Opinion = opinionActualizada.Opinion;
        compra.Calificacion = opinionActualizada.Calificacion;

        await compraProductoRepository.GuardarAsync(compra);
        return Ok(ApiResponse<CompraProducto>.Ok(compra, "Opinión registrada correctamente."));
    }
}
