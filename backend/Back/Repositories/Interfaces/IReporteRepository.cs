using Back.Entities;

namespace Back.Repositories.Interfaces{
    
    public interface IReporteRepository
    {
        /// <summary>
        /// Obtiene todos los reportes.
        /// </summary>
        Task<IEnumerable<Reporte>> ObtenerTodosAsync();

        /// <summary>
        /// Obtiene un reporte por su Id.
        /// </summary>
        Task<Reporte?> ObtenerPorIdAsync(string id);

        /// <summary>
        /// Crea un nuevo reporte.
        /// </summary>
        Task CrearAsync(Reporte reporte);

        /// <summary>
        /// Actualiza un reporte existente.
        /// </summary>
        Task ActualizarAsync(string id, Reporte reporte);

        /// <summary>
        /// Elimina un reporte.
        /// </summary>
        Task EliminarAsync(string id);
    }
}