using Back.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario?> GetByIdAsync(string id);
    Task<string> CreateAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task UpdatePasswordAsync(string id, string newPasswordHash);
    Task<IEnumerable<Usuario>> GetAllAsync(int page, int pageSize, string? rol = null);
    Task<int> GetTotalCountAsync(string? rol = null);
    Task<bool> ExistsEmailAsync(string email);
    Task<bool> ExistsByIdAsync(string id);
    Task DeleteAsync(string id);
}
