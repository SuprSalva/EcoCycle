using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;

namespace Back.ViewModels.Interfaces;

public interface IUsuarioViewModel
{
    Task<ApiResponse<UsuarioResponse>> GetPerfilAsync(string usuarioId);
    Task<ApiResponse<UsuarioResponse>> ActualizarPerfilAsync(string usuarioId, ActualizarPerfilRequest request);
    Task<ApiResponse<PuntosResponse>> GetPuntosAsync(string usuarioId);
    Task<ApiResponse<List<SesionResponse>>> GetHistorialAsync(string usuarioId, int page, int pageSize);
    Task<ApiResponse<List<CanjeResponse>>> GetCanjesAsync(string usuarioId, int page, int pageSize);
}
