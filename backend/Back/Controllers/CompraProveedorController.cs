using Back.DTOs;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/compras-proveedores")]
public class CompraProveedorController(
    ICompraProveedorRepository compraRepository,
    IProveedorRepository proveedorRepository,
    IRecompensaRepository recompensaRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCompras()
    {
        var compras = await compraRepository.ObtenerTodasAsync();
        var dtos = compras.Select(c => new CompraProveedorDTO
        {
            Id = c.Id,
            ProveedorId = c.ProveedorId,
            ProveedorNombre = c.ProveedorNombre,
            FechaCompra = c.FechaCompra,
            Total = c.Total,
            Estado = c.Estado,
            Detalles = c.Detalles.Select(d => new DetalleCompraDTO
            {
                RecompensaId = d.RecompensaId,
                NombreRecompensa = d.NombreRecompensa,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario
            }).ToList()
        }).ToList();

        return Ok(ApiResponse<List<CompraProveedorDTO>>.Ok(dtos));
    }

    [HttpPost]
    public async Task<IActionResult> RegistrarCompra([FromBody] CompraProveedorCrearDTO dto)
    {
        var proveedor = await proveedorRepository.ObtenerPorIdAsync(dto.ProveedorId);
        if (proveedor == null)
            return NotFound(ApiResponse<string>.Fail("Proveedor no encontrado"));

        var compra = new CompraProveedor
        {
            ProveedorId = proveedor.Id,
            ProveedorNombre = proveedor.Nombre,
            FechaCompra = DateTime.UtcNow,
            Estado = "Completado",
            Detalles = new List<DetalleCompra>()
        };

        double total = 0;

        foreach (var detalleDto in dto.Detalles)
        {
            var recompensa = await recompensaRepository.ObtenerPorIdAsync(detalleDto.RecompensaId);
            if (recompensa != null)
            {
                // Increment stock
                recompensa.Stock += detalleDto.Cantidad;
                await recompensaRepository.GuardarAsync(recompensa);
                
                var detalle = new DetalleCompra
                {
                    RecompensaId = recompensa.Id,
                    NombreRecompensa = recompensa.Nombre,
                    Cantidad = detalleDto.Cantidad,
                    PrecioUnitario = detalleDto.PrecioUnitario
                };
                
                compra.Detalles.Add(detalle);
                total += detalle.Cantidad * detalle.PrecioUnitario;
            }
        }

        compra.Total = total;

        await compraRepository.GuardarAsync(compra);

        return Ok(ApiResponse<string>.Ok(compra.Id, "Compra registrada exitosamente y stock actualizado"));
    }
}
