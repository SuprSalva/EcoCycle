using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Back.DTOs.Request;
using Back.Services.Interfaces;
using Back.Wrappers;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmpresaController(IEmpresaService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await service.ObtenerTodosAsync();
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CrearEmpresaRequest request)
    {
        var id = await service.CrearAsync(request);
        return Ok(ApiResponse<object>.Ok(new { id }));
    }
}