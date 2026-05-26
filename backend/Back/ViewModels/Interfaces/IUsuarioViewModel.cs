using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;

namespace Back.ViewModels.Interfaces;

public interface IUsuarioViewModel
{
    Task<ApiResponse<UsuarioResponse>> GetPerfilAsync(int usuarioId);
    Task<ApiResponse<UsuarioResponse>> ActualizarPerfilAsync(int usuarioId, ActualizarPerfilRequest request);
    Task<ApiResponse<PuntosResponse>> GetPuntosAsync(int usuarioId);
    Task<ApiResponse<List<SesionResponse>>> GetHistorialAsync(int usuarioId, int page, int pageSize);
    Task<ApiResponse<List<CanjeResponse>>> GetCanjesAsync(int usuarioId, int page, int pageSize);
}