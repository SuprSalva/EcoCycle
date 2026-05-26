using Back.Models.DTOs.Request;
using Back.ViewModels.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Back.Views;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioViewModel _usuarioViewModel;

    public UsuarioController(IUsuarioViewModel usuarioViewModel)
    {
        _usuarioViewModel = usuarioViewModel;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet("perfil")]
    public async Task<IActionResult> GetPerfil()
    {
        var userId = GetUserId();
        var result = await _usuarioViewModel.GetPerfilAsync(userId);
        return Ok(result);
    }

    [HttpPut("perfil")]
    public async Task<IActionResult> ActualizarPerfil([FromBody] ActualizarPerfilRequest request)
    {
        var userId = GetUserId();
        var result = await _usuarioViewModel.ActualizarPerfilAsync(userId, request);
        if (!result.Suceso)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("puntos")]
    public async Task<IActionResult> GetPuntos()
    {
        var userId = GetUserId();
        var result = await _usuarioViewModel.GetPuntosAsync(userId);
        return Ok(result);
    }

    [HttpGet("historial")]
    public async Task<IActionResult> GetHistorial([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var result = await _usuarioViewModel.GetHistorialAsync(userId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("canjes")]
    public async Task<IActionResult> GetCanjes([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var result = await _usuarioViewModel.GetCanjesAsync(userId, page, pageSize);
        return Ok(result);
    }
}