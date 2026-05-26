using Back.Models.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface IRecompensaRepository
{
    Task<Recompensa?> GetByIdAsync(int id);
    Task<IEnumerable<Recompensa>> GetAllAsync(bool soloActivas = true);
    Task<int> CreateAsync(Recompensa recompensa);
    Task UpdateAsync(Recompensa recompensa);
    Task DeleteAsync(int id);
    Task<bool> UpdateStockAsync(int id, int cantidad);
}