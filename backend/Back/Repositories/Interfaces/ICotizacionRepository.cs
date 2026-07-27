using Back.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories.Interfaces
{
    public interface ICotizacionRepository
    {
        Task<string> CrearCotizacionAsync(Cotizacion cotizacion);
        Task<List<Cotizacion>> ObtenerCotizacionesAsync();
        Task<Cotizacion?> ObtenerCotizacionPorIdAsync(string id);
        Task ActualizarCotizacionAsync(Cotizacion cotizacion);
        Task ActualizarEstatusAsync(string id, string estatus);
        Task EliminarCotizacionAsync(string id);
    }
}