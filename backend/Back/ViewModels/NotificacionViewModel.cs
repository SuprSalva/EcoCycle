using Back.Repositories.Interfaces;
using Back.Models.DTOs.Response;
using Back.ViewModels.Interfaces;

namespace Back.ViewModels;

public class NotificacionViewModel : INotificacionViewModel
{
    private readonly INotificacionRepository _notificacionRepository;

    public NotificacionViewModel(INotificacionRepository notificacionRepository)
    {
        _notificacionRepository = notificacionRepository;
    }

    public async Task<ApiResponse<List<NotificacionResponse>>> GetByUsuarioIdAsync(string usuarioId)
    {
        var notificaciones = await _notificacionRepository.GetByUsuarioIdAsync(usuarioId);
        
        var response = notificaciones.Select(n => new NotificacionResponse
        {
            Id = n.Id,
            Titulo = n.Titulo,
            Descripcion = n.Descripcion,
            Icono = n.Icono,
            Leida = n.Leida,
            Fecha = n.Fecha
        }).ToList();

        return ApiResponse<List<NotificacionResponse>>.Success(response);
    }

    public async Task<ApiResponse<bool>> MarcarComoLeidasAsync(string usuarioId)
    {
        await _notificacionRepository.MarcarComoLeidasAsync(usuarioId);
        return ApiResponse<bool>.Success(true, "Notificaciones marcadas como leídas");
    }
}
