using Back.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface IRecompensaRepository
{
    Task<Recompensa?> GetByIdAsync(string id);
    Task<IEnumerable<Recompensa>> GetAllAsync(bool soloActivas = true);
    Task<string> CreateAsync(Recompensa recompensa);
    Task UpdateAsync(Recompensa recompensa);
    Task DeleteAsync(string id);
    Task<bool> UpdateStockAsync(string id, int cantidad);
}
