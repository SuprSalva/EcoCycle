using Back.Models.Entities;

namespace Back.Infrastructure.Repositories.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<Usuario?> GetByIdAsync(int id);
    Task<int> CreateAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task UpdatePasswordAsync(int id, string newPasswordHash);
    Task<IEnumerable<Usuario>> GetAllAsync(int page, int pageSize, string? rol = null);
    Task<int> GetTotalCountAsync(string? rol = null);
    Task<bool> ExistsEmailAsync(string email);
    Task<bool> ExistsByIdAsync(int id);
    Task DeleteAsync(int id);
}