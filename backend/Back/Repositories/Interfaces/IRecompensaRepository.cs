using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IRecompensaRepository
{
    Task<List<Recompensa>> ObtenerActivasAsync();
    Task<Recompensa?> ObtenerPorIdAsync(string id);
    Task GuardarAsync(Recompensa recompensa);
    Task RegistrarCanjeAsync(Canje canje);
}
