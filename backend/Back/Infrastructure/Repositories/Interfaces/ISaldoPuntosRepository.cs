using Back.Models.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface ISaldoPuntosRepository
{
    Task<SaldoPuntos?> GetSaldoAsync(int usuarioId);
    Task<bool> AddPuntosAsync(int usuarioId, decimal puntos);
    Task<bool> SubtractPuntosAsync(int usuarioId, decimal puntos);
    Task InitializeSaldoAsync(int usuarioId);
}