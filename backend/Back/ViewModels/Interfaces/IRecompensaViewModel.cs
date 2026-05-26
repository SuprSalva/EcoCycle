using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;

namespace Back.ViewModels.Interfaces;

public interface IRecompensaViewModel
{
    Task<ApiResponse<List<RecompensaResponse>>> GetAllAsync(bool soloActivas = true);
    Task<ApiResponse<CanjeResponse>> CanjearAsync(int usuarioId, CanjeRequest request);
    Task<ApiResponse<RecompensaResponse>> CreateAsync(RecompensaRequest request);
    Task<ApiResponse<RecompensaResponse>> UpdateAsync(int id, RecompensaRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}