using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;

namespace Back.ViewModels.Interfaces;

public interface IReciclajeViewModel
{
    Task<ApiResponse<SesionResponse>> RegistrarSesionAsync(string usuarioId, SesionReciclajeRequest request);
    Task<ApiResponse<List<SesionResponse>>> GetHistorialGeneralAsync(DateTime? desde, DateTime? hasta, int page, int pageSize);
    Task<ApiResponse<DashboardStatsResponse>> GetDashboardStatsAsync();
}
