using System.Security.Claims;
using Back.DTOs.Request;
using Back.DTOs.Response;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecompensaController(IRecompensaRepository recompensaRepository, IUsuarioRepository usuarioRepository) : ControllerBase
{
    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value ?? string.Empty;

    /// <summary>
    /// Genera un código de canje corto de 6 caracteres (letras y números, sin ambiguos 0/O/1/I).
    /// </summary>
    private static string GenerarCodigoCanje()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6).Select(s => s[random.Next(s.Length)]).ToArray());
    }

    [HttpGet]
    public async Task<IActionResult> GetRecompensas()
    {
        var recompensas = await recompensaRepository.ObtenerActivasAsync();
        return Ok(ApiResponse<List<Recompensa>>.Ok(recompensas));
    }

    [HttpPost("canjear")]
    public async Task<IActionResult> Canjear([FromBody] CanjearRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var usuario = await usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario == null) return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        var recompensa = await recompensaRepository.ObtenerPorIdAsync(request.RecompensaId);
        if (recompensa == null || !recompensa.Activa) return NotFound(ApiResponse<object>.Fail("Recompensa no encontrada o inactiva."));

        if (recompensa.Stock == 0) return BadRequest(ApiResponse<object>.Fail("No hay stock disponible de esta recompensa."));

        if (usuario.SaldoPuntos < recompensa.CostoPuntos)
        {
            return BadRequest(ApiResponse<object>.Fail("Puntos insuficientes para este canje."));
        }

        // Aplicar el canje
        usuario.SaldoPuntos -= recompensa.CostoPuntos;

        if (recompensa.Stock > 0)
        {
            recompensa.Stock -= 1;
        }

        var canje = new Canje
        {
            UsuarioId = usuario.Id,
            RecompensaId = recompensa.Id,
            PuntosUsados = recompensa.CostoPuntos,
            Fecha = DateTime.UtcNow,
            CodigoCanje = GenerarCodigoCanje(),
            Reclamado = false,
            FechaReclamado = null
        };

        // Guardar cambios
        await usuarioRepository.GuardarAsync(usuario);
        await recompensaRepository.GuardarAsync(recompensa);
        await recompensaRepository.RegistrarCanjeAsync(canje);

        return Ok(ApiResponse<object>.Ok(new
        {
            canjeId = canje.Id,
            codigoCanje = canje.CodigoCanje,
            nuevoSaldo = usuario.SaldoPuntos,
            recompensaNombre = recompensa.Nombre
        }, "Canje realizado correctamente."));
    }

    /// <summary>
    /// Devuelve todos los canjes del usuario autenticado, incluyendo estado de reclamación y código.
    /// </summary>
    [HttpGet("mis-canjes")]
    public async Task<IActionResult> GetMisCanjes()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized(ApiResponse<object>.Fail("Token inválido."));

        var canjes = await recompensaRepository.ObtenerCanjesPorUsuarioAsync(userId);

        var recompensasCache = new Dictionary<string, Recompensa?>();
        var responseList = new List<CanjeUsuarioResponse>();

        foreach (var canje in canjes.OrderByDescending(c => c.Fecha))
        {
            if (string.IsNullOrWhiteSpace(canje.RecompensaId)) continue;

            if (!recompensasCache.ContainsKey(canje.RecompensaId))
            {
                recompensasCache[canje.RecompensaId] = await recompensaRepository.ObtenerPorIdAsync(canje.RecompensaId);
            }
            var recompensa = recompensasCache[canje.RecompensaId];

            responseList.Add(new CanjeUsuarioResponse
            {
                Id = canje.Id,
                CodigoCanje = canje.CodigoCanje,
                RecompensaId = canje.RecompensaId,
                RecompensaNombre = recompensa?.Nombre ?? "Premio Eliminado",
                RecompensaImagenUrl = recompensa?.ImagenUrl,
                PuntosUsados = canje.PuntosUsados,
                Fecha = canje.Fecha,
                Reclamado = canje.Reclamado,
                FechaReclamado = canje.FechaReclamado
            });
        }

        return Ok(ApiResponse<List<CanjeUsuarioResponse>>.Ok(responseList));
    }

    /// <summary>
    /// Endpoint para que el ADMIN marque un canje como reclamado (cuando el usuario va a recoger su premio).
    /// </summary>
    [HttpPut("canjes/{canjeId}/reclamar")]
    public async Task<IActionResult> MarcarReclamado(string canjeId)
    {
        var canje = await recompensaRepository.ObtenerCanjePorIdAsync(canjeId);
        if (canje == null) return NotFound(ApiResponse<object>.Fail("Canje no encontrado."));

        if (canje.Reclamado)
            return BadRequest(ApiResponse<object>.Fail("Este canje ya fue marcado como reclamado."));

        canje.Reclamado = true;
        canje.FechaReclamado = DateTime.UtcNow;
        await recompensaRepository.ActualizarCanjeAsync(canje);

        return Ok(ApiResponse<object>.Ok(new { canjeId = canje.Id, fechaReclamado = canje.FechaReclamado }, "Canje marcado como reclamado correctamente."));
    }

    [HttpGet("admin")]
    public async Task<IActionResult> GetRecompensasAdmin()
    {
        var recompensas = await recompensaRepository.ObtenerTodasAsync();
        return Ok(ApiResponse<List<Recompensa>>.Ok(recompensas));
    }

    [HttpGet("canjes/admin")]
    public async Task<IActionResult> GetCanjesAdmin([FromQuery] DateTime? inicio, [FromQuery] DateTime? fin)
    {
        var todosLosCanjes = await recompensaRepository.ObtenerTodosLosCanjesAsync();

        // Filtrar por fecha si vienen los parámetros
        if (inicio.HasValue)
        {
            todosLosCanjes = todosLosCanjes.Where(c => c.Fecha.Date >= inicio.Value.Date).ToList();
        }

        if (fin.HasValue)
        {
            todosLosCanjes = todosLosCanjes.Where(c => c.Fecha.Date <= fin.Value.Date).ToList();
        }

        var responseList = new List<CanjeAdminResponse>();

        var usuariosCache = new Dictionary<string, Usuario?>();
        var recompensasCache = new Dictionary<string, Recompensa?>();

        foreach (var canje in todosLosCanjes.OrderByDescending(c => c.Fecha))
        {
            // 🛠️ PROTECCIÓN: Si el canje no tiene un UsuarioId asignado, saltamos este bucle para evitar errores latentes.
            if (string.IsNullOrWhiteSpace(canje.UsuarioId))
            {
                continue; 
            }

            if (!usuariosCache.ContainsKey(canje.UsuarioId))
            {
                usuariosCache[canje.UsuarioId] = await usuarioRepository.ObtenerPorIdAsync(canje.UsuarioId);
            }

            // Validación adicional para prevenir fallos si RecompensaId estuviera vacío en algún documento viejo
            if (!string.IsNullOrWhiteSpace(canje.RecompensaId) && !recompensasCache.ContainsKey(canje.RecompensaId))
            {
                recompensasCache[canje.RecompensaId] = await recompensaRepository.ObtenerPorIdAsync(canje.RecompensaId);
            }

            var usuario = usuariosCache[canje.UsuarioId];
            var recompensa = !string.IsNullOrWhiteSpace(canje.RecompensaId) && recompensasCache.ContainsKey(canje.RecompensaId) 
                ? recompensasCache[canje.RecompensaId] 
                : null;

            responseList.Add(new CanjeAdminResponse
            {
                Id = canje.Id,
                CodigoCanje = canje.CodigoCanje,
                UsuarioId = canje.UsuarioId,
                UsuarioNombre = usuario != null ? $"{usuario.Nombre} {usuario.Apellidos}".Trim() : "Usuario Desconocido / Inactivo",
                UsuarioEmail = usuario?.Email ?? "Sin Email",
                RecompensaId = canje.RecompensaId,
                RecompensaNombre = recompensa?.Nombre ?? "Recompensa Eliminada/Desconocida",
                PuntosUsados = canje.PuntosUsados,
                Fecha = canje.Fecha,
                Reclamado = canje.Reclamado,
                FechaReclamado = canje.FechaReclamado
            });
        }

        return Ok(ApiResponse<List<CanjeAdminResponse>>.Ok(responseList));
    }

    [HttpPost]
    public async Task<IActionResult> CrearRecompensa([FromBody] RecompensaRequest request)
    {
        var recompensa = new Recompensa
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            CostoPuntos = request.CostoPuntos,
            Stock = request.Stock,
            Activa = request.Activa,
            ImagenUrl = request.ImagenUrl
        };
        await recompensaRepository.GuardarAsync(recompensa);
        return Ok(ApiResponse<object>.Ok(null, "Recompensa creada correctamente."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarRecompensa(string id, [FromBody] RecompensaRequest request)
    {
        var recompensa = await recompensaRepository.ObtenerPorIdAsync(id);
        if (recompensa == null) return NotFound(ApiResponse<object>.Fail("Recompensa no encontrada."));

        recompensa.Nombre = request.Nombre;
        recompensa.Descripcion = request.Descripcion;
        recompensa.CostoPuntos = request.CostoPuntos;
        recompensa.Stock = request.Stock;
        recompensa.Activa = request.Activa;
        recompensa.ImagenUrl = request.ImagenUrl;

        await recompensaRepository.GuardarAsync(recompensa);
        return Ok(ApiResponse<object>.Ok(null, "Recompensa actualizada correctamente."));
    }

    [HttpPut("{id}/estatus")]
    public async Task<IActionResult> CambiarEstatusRecompensa(string id, [FromBody] CambiarEstatusRecompensaRequest request)
    {
        var recompensa = await recompensaRepository.ObtenerPorIdAsync(id);
        if (recompensa == null) return NotFound(ApiResponse<object>.Fail("Recompensa no encontrada."));

        recompensa.Activa = request.Activa;
        await recompensaRepository.GuardarAsync(recompensa);
        return Ok(ApiResponse<object>.Ok(null, "Estatus de la recompensa actualizado correctamente."));
    }
}