using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorIdAsync(string id);
    Task<Usuario?> ObtenerPorEmailAsync(string email);
    Task GuardarAsync(Usuario usuario);
    Task<List<Usuario>> ObtenerTodosAsync();
    Task EliminarAsync(string id);
}
