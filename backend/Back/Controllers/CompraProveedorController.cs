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
    IMateriaPrimaRepository materiaPrimaRepository) : ControllerBase
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
                MateriaPrimaId = d.MateriaPrimaId,
                NombreMateriaPrima = d.NombreMateriaPrima,
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
            var materiaPrima = await materiaPrimaRepository.ObtenerPorNombreAsync(detalleDto.NombreMateriaPrima);
            if (materiaPrima == null)
            {
                return BadRequest(ApiResponse<string>.Fail($"La materia prima '{detalleDto.NombreMateriaPrima}' no existe en el sistema. Por favor, agrégala primero en el módulo de Materia Prima."));
            }

            // Calculate new average cost
            double totalValue = (materiaPrima.StockActual * materiaPrima.CostoPromedioUnitario) + (detalleDto.Cantidad * detalleDto.PrecioUnitario);
            materiaPrima.StockActual += detalleDto.Cantidad;
            materiaPrima.CostoPromedioUnitario = totalValue / materiaPrima.StockActual;
            
            await materiaPrimaRepository.GuardarAsync(materiaPrima);
            
            var detalle = new DetalleCompra
            {
                MateriaPrimaId = materiaPrima.Id,
                NombreMateriaPrima = materiaPrima.Nombre,
                Cantidad = detalleDto.Cantidad,
                PrecioUnitario = detalleDto.PrecioUnitario
            };
            
            compra.Detalles.Add(detalle);
            total += detalle.Cantidad * detalle.PrecioUnitario;
        }

        compra.Total = total;

        await compraRepository.GuardarAsync(compra);

        return Ok(ApiResponse<string>.Ok(compra.Id, "Compra registrada exitosamente y stock actualizado"));
    }
}
