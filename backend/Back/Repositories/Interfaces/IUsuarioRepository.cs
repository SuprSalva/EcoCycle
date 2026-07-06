// 📁 Back/Repositories/Interfaces/IUsuarioRepository.cs
using Back.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories.Interfaces
{
    public interface IUsuarioRepository
    {
        // Métodos con tipos de retorno que coinciden
        Task<Usuario?> ObtenerPorIdAsync(string id);  // ✅ Con ? para permitir null
        Task<Usuario?> ObtenerPorEmailAsync(string email);  // ✅ Con ? para permitir null
        Task<IEnumerable<Usuario>> ObtenerTodosAsync();
        Task<IEnumerable<Usuario>> ObtenerPorRolAsync(string rol);
        Task GuardarAsync(Usuario usuario);
        Task ActualizarAsync(Usuario usuario);
        Task EliminarAsync(string id);
        Task<bool> ExisteEmailAsync(string email);
    }
}