using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IRecompensaRepository
{
    Task<List<Recompensa>> ObtenerTodasAsync();
    Task<List<Recompensa>> ObtenerActivasAsync();
    Task<Recompensa?> ObtenerPorIdAsync(string id);
    Task GuardarAsync(Recompensa recompensa);
    Task RegistrarCanjeAsync(Canje canje);
    Task<List<Canje>> ObtenerCanjesPorUsuarioAsync(string userId);
    Task<List<Canje>> ObtenerTodosLosCanjesAsync();
    Task<Canje?> ObtenerCanjePorIdAsync(string canjeId);
    Task ActualizarCanjeAsync(Canje canje);
}
