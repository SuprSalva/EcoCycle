using Back.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories.Interfaces
{
    public interface IRecetasDetalleRepository
    {
        Task<string> CrearDetalleAsync(RecetasDetalle detalle);
        Task<List<RecetasDetalle>> ObtenerDetallesPorRecetaIdAsync(string recetaId);
        Task<RecetasDetalle?> ObtenerDetallePorIdAsync(string id);
        Task ActualizarDetalleAsync(RecetasDetalle detalle);
        Task EliminarDetalleAsync(string id);
    }
}