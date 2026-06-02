using Back.Helpers;
using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.ViewModels.Interfaces;

namespace Back.ViewModels;

public class UsuarioViewModel : IUsuarioViewModel
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ISaldoPuntosRepository _saldoPuntosRepository;
    private readonly IReciclajeRepository _reciclajeRepository;
    private readonly ICanjeRepository _canjeRepository;

    public UsuarioViewModel(
        IUsuarioRepository usuarioRepository,
        ISaldoPuntosRepository saldoPuntosRepository,
        IReciclajeRepository reciclajeRepository,
        ICanjeRepository canjeRepository)
    {
        _usuarioRepository = usuarioRepository;
        _saldoPuntosRepository = saldoPuntosRepository;
        _reciclajeRepository = reciclajeRepository;
        _canjeRepository = canjeRepository;
    }

    public async Task<ApiResponse<UsuarioResponse>> GetPerfilAsync(string usuarioId)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
        if (usuario == null)
            return ApiResponse<UsuarioResponse>.Fail("Usuario no encontrado");

        var saldo = await _saldoPuntosRepository.GetSaldoAsync(usuarioId);
        var totalBotellas = await _reciclajeRepository.GetTotalBotellasByUsuarioIdAsync(usuarioId);
        var (nivel, meta, faltantes) = NivelHelper.CalcularNivel(totalBotellas);

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellidos = usuario.Apellidos,
            Telefono = usuario.Telefono,
            Email = usuario.Email,
            Direccion = usuario.Direccion,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            PuntosDisponibles = saldo,
            TotalBotellasRecicladas = totalBotellas,
            NivelActual = nivel,
            MetaActual = meta,
            FaltantesSiguienteNivel = faltantes
        };

        return ApiResponse<UsuarioResponse>.Success(response);
    }

    public async Task<ApiResponse<UsuarioResponse>> ActualizarPerfilAsync(string usuarioId, ActualizarPerfilRequest request)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
        if (usuario == null)
            return ApiResponse<UsuarioResponse>.Fail("Usuario no encontrado");

        usuario.Nombre = request.Nombre;
        usuario.Apellidos = request.Apellidos;
        usuario.Telefono = request.Telefono;
        usuario.Direccion = request.Direccion;

        await _usuarioRepository.UpdateAsync(usuario);

        var saldo = await _saldoPuntosRepository.GetSaldoAsync(usuarioId);
        var totalBotellas = await _reciclajeRepository.GetTotalBotellasByUsuarioIdAsync(usuarioId);
        var (nivel, meta, faltantes) = NivelHelper.CalcularNivel(totalBotellas);

        var response = new UsuarioResponse
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Apellidos = usuario.Apellidos,
            Telefono = usuario.Telefono,
            Email = usuario.Email,
            Direccion = usuario.Direccion,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            PuntosDisponibles = saldo,
            TotalBotellasRecicladas = totalBotellas,
            NivelActual = nivel,
            MetaActual = meta,
            FaltantesSiguienteNivel = faltantes
        };

        return ApiResponse<UsuarioResponse>.Success(response, "Perfil actualizado exitosamente");
    }

    public async Task<ApiResponse<PuntosResponse>> GetPuntosAsync(string usuarioId)
    {
        var saldo = await _saldoPuntosRepository.GetSaldoAsync(usuarioId);

        var response = new PuntosResponse
        {
            UsuarioId = usuarioId,
            Saldo = saldo
        };

        return ApiResponse<PuntosResponse>.Success(response);
    }

    public async Task<ApiResponse<List<SesionResponse>>> GetHistorialAsync(string usuarioId, int page, int pageSize)
    {
        var sesiones = await _reciclajeRepository.GetByUsuarioIdAsync(usuarioId, page, pageSize);
        var total = await _reciclajeRepository.GetCountByUsuarioIdAsync(usuarioId);

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

    public async Task<ApiResponse<List<CanjeResponse>>> GetCanjesAsync(string usuarioId, int page, int pageSize)
    {
        var canjes = await _canjeRepository.GetByUsuarioIdAsync(usuarioId, page, pageSize);

        var response = new List<CanjeResponse>();
        foreach (var canje in canjes)
        {
            response.Add(new CanjeResponse
            {
                Id = canje.Id,
                RecompensaId = canje.RecompensaId,
                PuntosUsados = canje.PuntosUsados,
                Fecha = canje.Fecha
            });
        }

        return ApiResponse<List<CanjeResponse>>.Success(response);
    }
}
