using Back.Models.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface ICanjeRepository
{
    Task<int> CreateAsync(Canje canje);
    Task<IEnumerable<Canje>> GetByUsuarioIdAsync(int usuarioId, int page, int pageSize);
    Task<int> GetCountByUsuarioIdAsync(int usuarioId);
    Task<IEnumerable<Canje>> GetAllAsync(DateTime? desde, DateTime? hasta);
}