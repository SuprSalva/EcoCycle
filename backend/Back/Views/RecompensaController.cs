using Back.Models.DTOs.Request;
using Back.ViewModels.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Back.Views;

[Route("api/[controller]")]
[ApiController]
public class RecompensaController : ControllerBase
{
    private readonly IRecompensaViewModel _recompensaViewModel;

    public RecompensaController(IRecompensaViewModel recompensaViewModel)
    {
        _recompensaViewModel = recompensaViewModel;
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim ?? "0";
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] bool soloActivas = true)
    {
        var result = await _recompensaViewModel.GetAllAsync(soloActivas);
        return Ok(result);
    }

    [HttpPost("canjear")]
    [Authorize]
    public async Task<IActionResult> Canjear([FromBody] CanjeRequest request)
    {
        var userId = GetUserId();
        var result = await _recompensaViewModel.CanjearAsync(userId, request);
        if (!result.Suceso)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] RecompensaRequest request)
    {
        var result = await _recompensaViewModel.CreateAsync(request);
        if (!result.Suceso)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(string id, [FromBody] RecompensaRequest request)
    {
        var result = await _recompensaViewModel.UpdateAsync(id, request);
        if (!result.Suceso)
            return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _recompensaViewModel.DeleteAsync(id);
        if (!result.Suceso)
            return BadRequest(result);
        return Ok(result);
    }
}
