using System.Security.Claims;
using Back.Models.DTOs.Request;
using Back.Repositories.Interfaces;
using Back.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProduccionController : ControllerBase
    {
        private readonly ProduccionService _produccionService;
        private readonly IProduccionRepository _produccionRepository;

        public ProduccionController(
            ProduccionService produccionService,
            IProduccionRepository produccionRepository)
        {
            _produccionService = produccionService;
            _produccionRepository = produccionRepository;
        }

        private string GetUserId() =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("user_id")?.Value
            ?? string.Empty;

        // POST: api/produccion
        [HttpPost]
        public async Task<IActionResult> CrearProduccion([FromBody] CrearProduccionRequest request)
        {
            try
            {
                var produccion = await _produccionService.CrearProduccionAsync(request, GetUserId());
                return Ok(new
                {
                    exito = true,
                    mensaje = "Producción registrada correctamente. Se descontó la materia prima del inventario.",
                    produccion
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { exito = false, mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Stock insuficiente u otra regla de negocio.
                return BadRequest(new { exito = false, mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { exito = false, mensaje = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { exito = false, mensaje = "Ocurrió un error al registrar la producción." });
            }
        }

        // GET: api/produccion
        [HttpGet]
        public async Task<IActionResult> ObtenerProducciones()
        {
            var producciones = await _produccionRepository.ObtenerTodasAsync();
            return Ok(producciones);
        }

        // GET: api/produccion/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerProduccionPorId(string id)
        {
            var produccion = await _produccionRepository.ObtenerPorIdAsync(id);
            if (produccion == null)
                return NotFound(new { exito = false, mensaje = "La producción no existe." });

            return Ok(produccion);
        }

        // PATCH: api/produccion/{id}/estado
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(string id, [FromBody] CambiarEstadoProduccionRequest request)
        {
            try
            {
                var produccion = await _produccionService.CambiarEstadoAsync(id, request.Estado, GetUserId());
                return Ok(new
                {
                    exito = true,
                    mensaje = $"Estado actualizado a \"{produccion.Estado}\".",
                    produccion
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { exito = false, mensaje = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Stock insuficiente al reactivar u otra regla de negocio.
                return BadRequest(new { exito = false, mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { exito = false, mensaje = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { exito = false, mensaje = "Ocurrió un error al cambiar el estado de la producción." });
            }
        }
    }
}
