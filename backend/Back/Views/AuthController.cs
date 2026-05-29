using Back.Models.DTOs.Request;
using Back.ViewModels.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Back.Views;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthViewModel _authViewModel;

    public AuthController(IAuthViewModel authViewModel)
    {
        _authViewModel = authViewModel;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authViewModel.LoginAsync(request);
        if (!result.Suceso)
            return Unauthorized(result);

        return Ok(result);
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Registro([FromBody] RegistroRequest request)
    {
        var result = await _authViewModel.RegistroAsync(request);
        if (!result.Suceso)
            return BadRequest(result);

        return Ok(result);
    }
}
