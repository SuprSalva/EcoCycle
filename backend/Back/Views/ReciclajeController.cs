using Back.Models.DTOs.Request;
using Back.ViewModels.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Back.Views;

[Route("api/[controller]")]
[ApiController]
public class ReciclajeController : ControllerBase
{
    private readonly IReciclajeViewModel _reciclajeViewModel;

    public ReciclajeController(IReciclajeViewModel reciclajeViewModel)
    {
        _reciclajeViewModel = reciclajeViewModel;
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim ?? "0";
    }

    [HttpPost("sesion")]
    [Authorize]
    public async Task<IActionResult> RegistrarSesion([FromBody] SesionReciclajeRequest request)
    {
        var userId = GetUserId();
        var result = await _reciclajeViewModel.RegistrarSesionAsync(userId, request);
        if (!result.Suceso)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("historial")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetHistorialGeneral(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _reciclajeViewModel.GetHistorialGeneralAsync(desde, hasta, page, pageSize);
        return Ok(result);
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var result = await _reciclajeViewModel.GetDashboardStatsAsync();
        return Ok(result);
    }
}
