using Back.Auth;
using Back.DTOs;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[AdminOnly]
public class ProveedorController(IProveedorRepository proveedorRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProveedores()
    {
        var proveedores = await proveedorRepository.ObtenerTodosAsync();
        var dtos = proveedores.Select(p => new ProveedorDTO
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Empresa = p.Empresa,
            Telefono = p.Telefono,
            Email = p.Email,
            Direccion = p.Direccion
        }).ToList();

        return Ok(ApiResponse<List<ProveedorDTO>>.Ok(dtos));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProveedor(string id)
    {
        var proveedor = await proveedorRepository.ObtenerPorIdAsync(id);
        if (proveedor == null)
            return NotFound(ApiResponse<string>.Fail("Proveedor no encontrado"));

        var dto = new ProveedorDTO
        {
            Id = proveedor.Id,
            Nombre = proveedor.Nombre,
            Empresa = proveedor.Empresa,
            Telefono = proveedor.Telefono,
            Email = proveedor.Email,
            Direccion = proveedor.Direccion
        };

        return Ok(ApiResponse<ProveedorDTO>.Ok(dto));
    }

    [HttpPost]
    public async Task<IActionResult> CrearProveedor([FromBody] ProveedorCrearDTO dto)
    {
        var proveedor = new Proveedor
        {
            Id = Guid.NewGuid().ToString("N"),
            Nombre = dto.Nombre,
            Empresa = dto.Empresa,
            Telefono = dto.Telefono,
            Email = dto.Email,
            Direccion = dto.Direccion,
            Activo = true
        };

        await proveedorRepository.GuardarAsync(proveedor);

        return Ok(ApiResponse<string>.Ok(proveedor.Id, "Proveedor creado exitosamente"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarProveedor(string id, [FromBody] ProveedorCrearDTO dto)
    {
        var proveedor = await proveedorRepository.ObtenerPorIdAsync(id);
        if (proveedor == null)
            return NotFound(ApiResponse<string>.Fail("Proveedor no encontrado"));

        proveedor.Nombre = dto.Nombre;
        proveedor.Empresa = dto.Empresa;
        proveedor.Telefono = dto.Telefono;
        proveedor.Email = dto.Email;
        proveedor.Direccion = dto.Direccion;

        await proveedorRepository.GuardarAsync(proveedor);

        return Ok(ApiResponse<string>.Ok(id, "Proveedor actualizado exitosamente"));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarProveedor(string id)
    {
        var proveedor = await proveedorRepository.ObtenerPorIdAsync(id);
        if (proveedor == null)
            return NotFound(ApiResponse<string>.Fail("Proveedor no encontrado"));

        await proveedorRepository.EliminarAsync(id);
        return Ok(ApiResponse<bool>.Ok(true, "Proveedor eliminado"));
    }
}
