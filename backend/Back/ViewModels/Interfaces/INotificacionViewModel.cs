using Back.Models.DTOs.Response;

namespace Back.ViewModels.Interfaces;

public interface INotificacionViewModel
{
    Task<ApiResponse<List<NotificacionResponse>>> GetByUsuarioIdAsync(string usuarioId);
    Task<ApiResponse<bool>> MarcarComoLeidasAsync(string usuarioId);
}
