using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.ViewModels.Interfaces;

namespace Back.ViewModels;

public class ReciclajeViewModel : IReciclajeViewModel
{
    private readonly IReciclajeRepository _reciclajeRepository;
    private readonly ISaldoPuntosRepository _saldoPuntosRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ICanjeRepository _canjeRepository;
    private readonly IRecompensaRepository _recompensaRepository;

    public ReciclajeViewModel(
        IReciclajeRepository reciclajeRepository,
        ISaldoPuntosRepository saldoPuntosRepository,
        IUsuarioRepository usuarioRepository,
        ICanjeRepository canjeRepository,
        IRecompensaRepository recompensaRepository)
    {
        _reciclajeRepository = reciclajeRepository;
        _saldoPuntosRepository = saldoPuntosRepository;
        _usuarioRepository = usuarioRepository;
        _canjeRepository = canjeRepository;
        _recompensaRepository = recompensaRepository;
    }

    public async Task<ApiResponse<SesionResponse>> RegistrarSesionAsync(int usuarioId, SesionReciclajeRequest request)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
        if (usuario == null || !usuario.Activo)
            return ApiResponse<SesionResponse>.Fail("Usuario no válido");

        var puntosObtenidos = request.Botellas * 0.10m;

        var sesion = new Models.Entities.SesionReciclaje
        {
            UsuarioId = usuarioId,
            MaquinaId = request.MaquinaId,
            Botellas = request.Botellas,
            Puntos = puntosObtenidos,
            Fecha = DateTime.UtcNow
        };

        await _reciclajeRepository.CreateAsync(sesion);
        await _saldoPuntosRepository.AddPuntosAsync(usuarioId, puntosObtenidos);

        var response = new SesionResponse
        {
            Id = sesion.Id,
            Botellas = sesion.Botellas,
            Puntos = sesion.Puntos,
            Fecha = sesion.Fecha,
            MaquinaId = sesion.MaquinaId
        };

        return ApiResponse<SesionResponse>.Success(response, $"¡Reciclaste {request.Botellas} botellas! Ganaste {puntosObtenidos} puntos");
    }

    public async Task<ApiResponse<List<SesionResponse>>> GetHistorialGeneralAsync(DateTime? desde, DateTime? hasta, int page, int pageSize)
    {
        var sesiones = await _reciclajeRepository.GetAllAsync(desde, hasta, page, pageSize);

        var response = sesiones.Select(s => new SesionResponse
        {
            Id = s.Id,
            Botellas = s.Botellas,
            Puntos = s.Puntos,
            Fecha = s.Fecha,
            MaquinaId = s.MaquinaId
        }).ToList();

        return ApiResponse<List<SesionResponse>>.Success(response);
    }

    public async Task<ApiResponse<DashboardStatsResponse>> GetDashboardStatsAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAsync(1, int.MaxValue);
        var usuariosActivos = usuarios.Count(u => u.Activo);
        var totalBotellas = await _reciclajeRepository.GetTotalBotellasByUsuarioIdAsync(0);
        var totalPuntosEmitidos = await _reciclajeRepository.GetTotalPuntosByUsuarioIdAsync(0);

        var canjes = await _canjeRepository.GetAllAsync(null, null);
        var totalPuntosCanjeados = canjes.Sum(c => c.PuntosUsados);
        var recompensasActivas = await _recompensaRepository.GetAllAsync(true);

        var response = new DashboardStatsResponse
        {
            TotalUsuarios = usuarios.Count(),
            UsuariosActivos = usuariosActivos,
            TotalBotellasRecicladas = totalBotellas,
            TotalPuntosEmitidos = totalPuntosEmitidos,
            TotalPuntosCanjeados = totalPuntosCanjeados,
            TotalCanjes = canjes.Count(),
            TotalRecompensasActivas = recompensasActivas.Count()
        };

        return ApiResponse<DashboardStatsResponse>.Success(response);
    }
}