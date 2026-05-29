using Back.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface IReciclajeRepository
{
    Task<string> CreateAsync(SesionReciclaje sesion);
    Task<IEnumerable<SesionReciclaje>> GetByUsuarioIdAsync(string usuarioId, int page, int pageSize);
    Task<int> GetCountByUsuarioIdAsync(string usuarioId);
    Task<IEnumerable<SesionReciclaje>> GetAllAsync(DateTime? desde, DateTime? hasta, int page, int pageSize);
    Task<int> GetTotalBotellasByUsuarioIdAsync(string usuarioId);
    Task<double> GetTotalPuntosByUsuarioIdAsync(string usuarioId);
}
