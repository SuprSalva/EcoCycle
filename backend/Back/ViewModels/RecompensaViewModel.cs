using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.ViewModels.Interfaces;

namespace Back.ViewModels;

public class RecompensaViewModel : IRecompensaViewModel
{
    private readonly IRecompensaRepository _recompensaRepository;
    private readonly ISaldoPuntosRepository _saldoPuntosRepository;
    private readonly ICanjeRepository _canjeRepository;
    private readonly INotificacionRepository _notificacionRepository;

    public RecompensaViewModel(
        IRecompensaRepository recompensaRepository,
        ISaldoPuntosRepository saldoPuntosRepository,
        ICanjeRepository canjeRepository,
        INotificacionRepository notificacionRepository)
    {
        _recompensaRepository = recompensaRepository;
        _saldoPuntosRepository = saldoPuntosRepository;
        _canjeRepository = canjeRepository;
        _notificacionRepository = notificacionRepository;
    }

    public async Task<ApiResponse<List<RecompensaResponse>>> GetAllAsync(bool soloActivas = true)
    {
        var recompensas = await _recompensaRepository.GetAllAsync(soloActivas);
        var response = recompensas.Select(r => new RecompensaResponse
        {
            Id = r.Id,
            Nombre = r.Nombre,
            Descripcion = r.Descripcion,
            CostoPuntos = r.CostoPuntos,
            Stock = r.Stock,
            Activa = r.Activa
        }).ToList();
        return ApiResponse<List<RecompensaResponse>>.Success(response);
    }

    public async Task<ApiResponse<CanjeResponse>> CanjearAsync(string usuarioId, CanjeRequest request)
    {
        var recompensa = await _recompensaRepository.GetByIdAsync(request.RecompensaId);
        if (recompensa == null || !recompensa.Activa)
            return ApiResponse<CanjeResponse>.Fail("Recompensa no disponible");

        if (recompensa.Stock == 0)
            return ApiResponse<CanjeResponse>.Fail("Recompensa agotada");

        var saldo = await _saldoPuntosRepository.GetSaldoAsync(usuarioId);
        if (saldo < recompensa.CostoPuntos)
            return ApiResponse<CanjeResponse>.Fail("Puntos insuficientes");

        var canje = new Canje
        {
            UsuarioId = usuarioId,
            RecompensaId = request.RecompensaId,
            PuntosUsados = recompensa.CostoPuntos,
            Fecha = DateTime.UtcNow
        };
        await _canjeRepository.CreateAsync(canje);
        await _saldoPuntosRepository.SubtractPuntosAsync(usuarioId, recompensa.CostoPuntos);

        if (recompensa.Stock > 0)
            await _recompensaRepository.UpdateStockAsync(request.RecompensaId, 1);

        // Notificación de canje
        var notiCanje = new Notificacion
        {
            UsuarioId = usuarioId,
            Titulo = "¡Canje exitoso!",
            Descripcion = $"Has canjeado {recompensa.Nombre} con éxito usando {recompensa.CostoPuntos} pts.",
            Icono = "CardGiftcard",
            Fecha = DateTime.UtcNow
        };
        await _notificacionRepository.CreateAsync(notiCanje);

        var response = new CanjeResponse
        {
            Id = canje.Id,
            RecompensaId = canje.RecompensaId,
            RecompensaNombre = recompensa.Nombre,
            PuntosUsados = canje.PuntosUsados,
            Fecha = canje.Fecha
        };
        return ApiResponse<CanjeResponse>.Success(response, $"¡Canjeaste {recompensa.Nombre} con éxito!");
    }

    public async Task<ApiResponse<RecompensaResponse>> CreateAsync(RecompensaRequest request)
    {
        var recompensa = new Recompensa
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            CostoPuntos = request.CostoPuntos,
            Stock = request.Stock,
            Activa = request.Activa
        };
        var id = await _recompensaRepository.CreateAsync(recompensa);
        recompensa.Id = id;
        var response = new RecompensaResponse
        {
            Id = recompensa.Id,
            Nombre = recompensa.Nombre,
            Descripcion = recompensa.Descripcion,
            CostoPuntos = recompensa.CostoPuntos,
            Stock = recompensa.Stock,
            Activa = recompensa.Activa
        };
        return ApiResponse<RecompensaResponse>.Success(response, "Recompensa creada exitosamente");
    }

    public async Task<ApiResponse<RecompensaResponse>> UpdateAsync(string id, RecompensaRequest request)
    {
        var recompensa = await _recompensaRepository.GetByIdAsync(id);
        if (recompensa == null)
            return ApiResponse<RecompensaResponse>.Fail("Recompensa no encontrada");
        recompensa.Nombre = request.Nombre;
        recompensa.Descripcion = request.Descripcion;
        recompensa.CostoPuntos = request.CostoPuntos;
        recompensa.Stock = request.Stock;
        recompensa.Activa = request.Activa;
        await _recompensaRepository.UpdateAsync(recompensa);
        var response = new RecompensaResponse
        {
            Id = recompensa.Id,
            Nombre = recompensa.Nombre,
            Descripcion = recompensa.Descripcion,
            CostoPuntos = recompensa.CostoPuntos,
            Stock = recompensa.Stock,
            Activa = recompensa.Activa
        };
        return ApiResponse<RecompensaResponse>.Success(response, "Recompensa actualizada exitosamente");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(string id)
    {
        var recompensa = await _recompensaRepository.GetByIdAsync(id);
        if (recompensa == null)
            return ApiResponse<bool>.Fail("Recompensa no encontrada");
        await _recompensaRepository.DeleteAsync(id);
        return ApiResponse<bool>.Success(true, "Recompensa eliminada exitosamente");
    }
}
