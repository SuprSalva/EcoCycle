using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IMateriaPrimaRepository
{
    Task<MateriaPrima?> ObtenerPorIdAsync(string id);
    Task<List<MateriaPrima>> ObtenerTodasAsync();
    Task GuardarAsync(MateriaPrima materiaPrima);
    Task EliminarAsync(string id);
}
