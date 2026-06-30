using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IProveedorRepository
{
    Task<Proveedor?> ObtenerPorIdAsync(string id);
    Task<List<Proveedor>> ObtenerTodosAsync();
    Task GuardarAsync(Proveedor proveedor);
    Task EliminarAsync(string id);
}
