using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;

namespace Back.ViewModels.Interfaces;

public interface IAuthViewModel
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UsuarioResponse>> RegistroAsync(RegistroRequest request);
}