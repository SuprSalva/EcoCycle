using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface INotificacionRepository
{
    Task<string> CreateAsync(Notificacion notificacion);
    Task<IEnumerable<Notificacion>> GetByUsuarioIdAsync(string usuarioId);
    Task MarcarComoLeidasAsync(string usuarioId);
}
