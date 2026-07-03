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
public class MateriaPrimaController(IMateriaPrimaRepository materiaPrimaRepository, IMateriaPrimaTransaccionRepository transaccionRepository) : ControllerBase
{
    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value ?? string.Empty;

    [HttpGet]
    public async Task<IActionResult> ObtenerTodas()
    {
        var materias = await materiaPrimaRepository.ObtenerTodasAsync();
        return Ok(ApiResponse<List<MateriaPrima>>.Ok(materias));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(string id)
    {
        var mp = await materiaPrimaRepository.ObtenerPorIdAsync(id);
        if (mp == null) return NotFound(ApiResponse<object>.Fail("Materia prima no encontrada."));
        return Ok(ApiResponse<MateriaPrima>.Ok(mp));
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] MateriaPrima materiaPrima)
    {
        materiaPrima.Id = string.Empty; // Asegurar que sea nuevo
        await materiaPrimaRepository.GuardarAsync(materiaPrima);
        return Ok(ApiResponse<MateriaPrima>.Ok(materiaPrima, "Materia prima creada exitosamente."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Actualizar(string id, [FromBody] MateriaPrima materiaPrimaActualizada)
    {
        var mp = await materiaPrimaRepository.ObtenerPorIdAsync(id);
        if (mp == null) return NotFound(ApiResponse<object>.Fail("Materia prima no encontrada."));

        mp.Nombre = materiaPrimaActualizada.Nombre;
        mp.Unidad = materiaPrimaActualizada.Unidad;
        mp.UltimaActualizacion = DateTime.UtcNow;

        await materiaPrimaRepository.GuardarAsync(mp);
        return Ok(ApiResponse<MateriaPrima>.Ok(mp, "Materia prima actualizada correctamente."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Eliminar(string id)
    {
        await materiaPrimaRepository.EliminarAsync(id);
        return Ok(ApiResponse<object>.Ok(null, "Materia prima eliminada correctamente."));
    }

    [HttpPost("{id}/transaccion")]
    public async Task<IActionResult> RegistrarTransaccion(string id, [FromBody] MateriaPrimaTransaccion transaccion)
    {
        if (transaccion.Cantidad <= 0)
            return BadRequest(ApiResponse<object>.Fail("La cantidad de la transacción debe ser mayor a cero."));

        var mp = await materiaPrimaRepository.ObtenerPorIdAsync(id);
        if (mp == null) return NotFound(ApiResponse<object>.Fail("Materia prima no encontrada."));

        var userId = GetUserId();
        transaccion.MateriaPrimaId = id;
        transaccion.UsuarioId = userId;
        transaccion.Fecha = DateTime.UtcNow;

        if (transaccion.Tipo == "Entrada")
        {
            if (transaccion.CostoUnitario < 0)
                return BadRequest(ApiResponse<object>.Fail("El costo unitario no puede ser negativo en una entrada."));

            // Calcular Costo Promedio Unitario
            double costoTotalActual = mp.StockActual * mp.CostoPromedioUnitario;
            double costoEntrada = transaccion.Cantidad * transaccion.CostoUnitario;
            
            mp.StockActual += transaccion.Cantidad;
            
            if (mp.StockActual > 0)
            {
                mp.CostoPromedioUnitario = (costoTotalActual + costoEntrada) / mp.StockActual;
            }
        }
        else if (transaccion.Tipo == "Salida")
        {
            if (transaccion.Cantidad > mp.StockActual)
                return BadRequest(ApiResponse<object>.Fail("Stock insuficiente para la salida."));

            transaccion.CostoUnitario = mp.CostoPromedioUnitario; // La salida es al costo promedio actual
            mp.StockActual -= transaccion.Cantidad;
        }
        else
        {
            return BadRequest(ApiResponse<object>.Fail("Tipo de transacción inválido. Use Entrada o Salida."));
        }

        mp.UltimaActualizacion = DateTime.UtcNow;

        await materiaPrimaRepository.GuardarAsync(mp);
        await transaccionRepository.GuardarAsync(transaccion);

        return Ok(ApiResponse<MateriaPrima>.Ok(mp, "Transacción registrada y costo actualizado."));
    }

    [HttpGet("{id}/transacciones")]
    public async Task<IActionResult> ObtenerTransacciones(string id)
    {
        var transacciones = await transaccionRepository.ObtenerPorMateriaPrimaIdAsync(id);
        return Ok(ApiResponse<List<MateriaPrimaTransaccion>>.Ok(transacciones));
    }
}
