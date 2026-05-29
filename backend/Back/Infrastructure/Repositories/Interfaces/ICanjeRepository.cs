using Back.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface ICanjeRepository
{
    Task<string> CreateAsync(Canje canje);
    Task<IEnumerable<Canje>> GetByUsuarioIdAsync(string usuarioId, int page, int pageSize);
    Task<int> GetCountByUsuarioIdAsync(string usuarioId);
    Task<IEnumerable<Canje>> GetAllAsync(DateTime? desde, DateTime? hasta);
}
