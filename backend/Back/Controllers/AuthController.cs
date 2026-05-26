using System.Security.Claims;
using Back.DTOs.Request;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IUsuarioRepository usuarioRepository) : ControllerBase
{
    [HttpPost("registro")]
    [Authorize] // Requiere un JWT de Firebase válido
    public async Task<IActionResult> Registro([FromBody] RegistroRequest request)
    {
        // Obtenemos los claims de Firebase
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;
        var email = User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
        {
            return BadRequest(ApiResponse<object>.Fail("Token inválido o incompleto. Faltan claims de Firebase."));
        }

        // Verificamos si el usuario ya existe
        var existente = await usuarioRepository.ObtenerPorIdAsync(userId);
        if (existente != null)
        {
            return BadRequest(ApiResponse<object>.Fail("El usuario ya se encuentra registrado."));
        }

        var usuario = new Usuario
        {
            Id = userId,
            Email = email,
            Nombre = request.Nombre,
            Apellidos = request.Apellidos,
            Telefono = request.Telefono,
            Direccion = request.Direccion,
            Rol = "usuario",
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        await usuarioRepository.GuardarAsync(usuario);

        return Ok(ApiResponse<object>.Ok(new { id = usuario.Id }, "Usuario registrado correctamente en la base de datos local."));
    }
}
