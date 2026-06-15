using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface ISesionReciclajeRepository
{
    Task GuardarAsync(SesionReciclaje sesion);
    Task<List<SesionReciclaje>> ObtenerPorUsuarioAsync(string usuarioId);
    Task<List<SesionReciclaje>> ObtenerTodasAsync();
}
