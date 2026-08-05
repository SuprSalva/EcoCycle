using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IProduccionRepository
{
    Task<List<Produccion>> ObtenerTodasAsync();
    Task<Produccion?> ObtenerPorIdAsync(string id);
}
