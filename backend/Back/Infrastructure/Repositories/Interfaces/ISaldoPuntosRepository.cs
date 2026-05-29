namespace Back.Infrastructure.Repositories.Interfaces;

public interface ISaldoPuntosRepository
{
    Task<double> GetSaldoAsync(string usuarioId);
    Task<bool> AddPuntosAsync(string usuarioId, double puntos);
    Task<bool> SubtractPuntosAsync(string usuarioId, double puntos);
    Task InitializeSaldoAsync(string usuarioId);
}
