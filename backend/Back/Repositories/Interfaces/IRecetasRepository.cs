using Back.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories.Interfaces
{
    public interface IRecetasRepository
    {
        Task<string> CrearRecetaAsync(Recetas receta);
        Task<List<Recetas>> ObtenerRecetasAsync();
        Task<Recetas?> ObtenerRecetaPorIdAsync(string id);
        Task ActualizarRecetaAsync(Recetas receta);
        Task ActualizarEstatusActivoAsync(string id, bool activo);
        Task EliminarRecetaAsync(string id);
        Task<Recetas?> ObtenerPorProductoIdAsync(string productoId);
    }
}