using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface ICompraProductoRepository
{
    Task<List<CompraProducto>> ObtenerPorUsuarioIdAsync(string usuarioId);
    Task<List<CompraProducto>> ObtenerTodasAsync(); 
    Task<CompraProducto?> ObtenerPorIdAsync(string id);
    Task GuardarAsync(CompraProducto compra);
}
