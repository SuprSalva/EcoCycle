using Back.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories.Interfaces
{
    public interface IProductosRepository
    {
        Task<string> CrearProductoAsync(Productos producto);
        Task<List<Productos>> ObtenerProductosAsync();
        Task<Productos?> ObtenerProductoPorIdAsync(string id);
        Task ActualizarProductoAsync(Productos producto);
        Task ActualizarEstatusActivoAsync(string id, bool activo);
        Task EliminarProductoAsync(string id);
    }
}