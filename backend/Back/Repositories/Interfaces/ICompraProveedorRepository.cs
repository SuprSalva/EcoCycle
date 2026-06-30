using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface ICompraProveedorRepository
{
    Task<CompraProveedor?> ObtenerPorIdAsync(string id);
    Task<List<CompraProveedor>> ObtenerTodasAsync();
    Task GuardarAsync(CompraProveedor compra);
}
