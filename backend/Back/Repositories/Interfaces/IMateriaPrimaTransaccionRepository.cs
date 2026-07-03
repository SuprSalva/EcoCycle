using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IMateriaPrimaTransaccionRepository
{
    Task<List<MateriaPrimaTransaccion>> ObtenerPorMateriaPrimaIdAsync(string materiaPrimaId);
    Task GuardarAsync(MateriaPrimaTransaccion transaccion);
}
