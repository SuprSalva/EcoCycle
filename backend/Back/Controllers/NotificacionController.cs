using Back.Models.DTOs.Response;
using Back.ViewModels.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificacionController : ControllerBase
{
    private readonly INotificacionViewModel _notificacionViewModel;

    public NotificacionController(INotificacionViewModel notificacionViewModel)
    {
        _notificacionViewModel = notificacionViewModel;
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim ?? string.Empty;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificacionResponse>>>> GetMisNotificaciones()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var response = await _notificacionViewModel.GetByUsuarioIdAsync(userId);
        return Ok(response);
    }

    [HttpPut("leer")]
    public async Task<ActionResult<ApiResponse<bool>>> MarcarComoLeidas()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var response = await _notificacionViewModel.MarcarComoLeidasAsync(userId);
        return Ok(response);
    }
}
