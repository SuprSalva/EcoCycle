using Back.Models.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface IReciclajeRepository
{
    Task<int> CreateAsync(SesionReciclaje sesion);
    Task<IEnumerable<SesionReciclaje>> GetByUsuarioIdAsync(int usuarioId, int page, int pageSize);
    Task<int> GetCountByUsuarioIdAsync(int usuarioId);
    Task<IEnumerable<SesionReciclaje>> GetAllAsync(DateTime? desde, DateTime? hasta, int page, int pageSize);
    Task<int> GetTotalBotellasByUsuarioIdAsync(int usuarioId);
    Task<decimal> GetTotalPuntosByUsuarioIdAsync(int usuarioId);
}