using Back.Entities;

namespace Back.Repositories.Interfaces;

public interface IComentariosRepository
{
    Task<string> CrearComentarioAsync(Comentarios comentario);
    Task<List<Comentarios>> ObtenerComentariosAsync();
    Task<Comentarios?> ObtenerComentarioPorIdAsync(string id);
    Task ActualizarComentarioAsync(Comentarios comentario);
    Task EliminarComentarioAsync(string id);
    Task<List<Comentarios>> ObtenerComentariosPublicosAsync();
    Task CambiarVisibilidadAsync(string id, bool esPublico);
}