
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
[Authorize]
public class CompraProductoController : ControllerBase
{
    private readonly ICompraProductoRepository _compraProductoRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public CompraProductoController(
        ICompraProductoRepository compraProductoRepository,
        IUsuarioRepository usuarioRepository)
    {
        _compraProductoRepository = compraProductoRepository;
        _usuarioRepository = usuarioRepository;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                                   User.FindFirst("user_id")?.Value ?? 
                                   string.Empty;

    [HttpGet("mis-compras")]
    public async Task<IActionResult> ObtenerMisCompras()
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) 
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var compras = await _compraProductoRepository.ObtenerPorUsuarioIdAsync(userId);
            
            var resultado = compras.Select(c => new
            {
                c.Id,
                c.UsuarioId,
                c.NombreProducto,
                c.Descripcion,
                c.FechaCompra,
                c.PrecioTotal,
                c.ManualUrl,
                c.Opinion,
                c.Calificacion,
                c.Estado,  // ✅ AGREGAR ESTADO
                cantidad = 1,
                precioUnitario = c.PrecioTotal,
                total = c.PrecioTotal
            });

            return Ok(ApiResponse<object>.Ok(resultado, "Compras obtenidas correctamente."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
        }
    }

    [HttpGet("todas")]
    public async Task<IActionResult> ObtenerTodasLasCompras()
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) 
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            if (usuario == null || usuario.Rol?.ToLower() != "admin")
                return Forbid("Acceso denegado. Solo administradores.");

            var compras = await _compraProductoRepository.ObtenerTodasAsync();
            
            var resultado = compras.Select(c => new
            {
                c.Id,
                c.UsuarioId,
                c.NombreProducto,
                c.Descripcion,
                c.FechaCompra,
                c.PrecioTotal,
                c.ManualUrl,
                c.Opinion,
                c.Calificacion,
                c.Estado,  // ✅ AGREGAR ESTADO
                cantidad = 1,
                precioUnitario = c.PrecioTotal,
                total = c.PrecioTotal
            });

            return Ok(ApiResponse<object>.Ok(resultado, "Todas las compras obtenidas correctamente."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
        }
    }

    [HttpPost]
    public async Task<IActionResult> RegistrarCompra([FromBody] RegistrarCompraRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) 
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var compra = new CompraProducto
            {
                Id = Guid.NewGuid().ToString(),
                UsuarioId = userId,
                NombreProducto = request.NombreProducto,
                Descripcion = request.Descripcion ?? "",
                PrecioTotal = request.Cantidad * request.PrecioUnitario,
                FechaCompra = DateTime.UtcNow,
                ManualUrl = request.ManualUrl ?? "",
                Opinion = "",
                Calificacion = 0,
                Estado = "Pendiente"
            };

            await _compraProductoRepository.GuardarAsync(compra);

            return Ok(ApiResponse<object>.Ok(new
            {
                compra.Id,
                compra.NombreProducto,
                compra.PrecioTotal,
                compra.FechaCompra,
                compra.Estado
            }, "Compra registrada exitosamente."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
        }
    }

    [HttpPut("{id}/opinion")]
    public async Task<IActionResult> DejarOpinion(string id, [FromBody] OpinionRequest request)
    {
        try
        {
            if (request.Calificacion < 1 || request.Calificacion > 5)
                return BadRequest(ApiResponse<object>.Fail("La calificación debe estar entre 1 y 5 estrellas."));

            if (string.IsNullOrWhiteSpace(request.Opinion))
                return BadRequest(ApiResponse<object>.Fail("La opinión no puede estar vacía."));

            var compra = await _compraProductoRepository.ObtenerPorIdAsync(id);
            if (compra == null) 
                return NotFound(ApiResponse<object>.Fail("Compra no encontrada."));

            var userId = GetUserId();
            if (compra.UsuarioId != userId) 
                return Forbid("No tienes permiso para opinar sobre esta compra.");

            compra.Opinion = request.Opinion;
            compra.Calificacion = request.Calificacion;

            await _compraProductoRepository.GuardarAsync(compra);

            return Ok(ApiResponse<object>.Ok(new
            {
                compra.Id,
                compra.Opinion,
                compra.Calificacion
            }, "Opinión registrada correctamente."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
        }
    }

    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(string id, [FromBody] ActualizarEstadoRequest request)
    {
        try
        {
            Console.WriteLine($"🔍 Actualizando estado de compra {id} a {request.Estado}");
            
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) 
                return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            if (usuario == null || usuario.Rol?.ToLower() != "admin")
                return Forbid("Acceso denegado. Solo administradores.");

            var compra = await _compraProductoRepository.ObtenerPorIdAsync(id);
            if (compra == null) 
                return NotFound(ApiResponse<object>.Fail("Compra no encontrada."));

            compra.Estado = request.Estado;
            Console.WriteLine($"✅ Estado actualizado a: {compra.Estado}");

            await _compraProductoRepository.GuardarAsync(compra);

            return Ok(ApiResponse<object>.Ok(new
            {
                compra.Id,
                compra.Estado
            }, $"Estado actualizado a '{request.Estado}' correctamente."));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
            return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
        }
    }
}

// ✅ DTO PARA ACTUALIZAR ESTADO (puede ir en el mismo archivo o en DTOs)
public class ActualizarEstadoRequest
{
    public string Estado { get; set; } = string.Empty;
}