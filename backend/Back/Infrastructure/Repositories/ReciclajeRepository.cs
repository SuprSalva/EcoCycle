using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.Entities;
using Dapper;

namespace Back.Infrastructure.Repositories;

public class ReciclajeRepository : IReciclajeRepository
{
    private readonly IDbConnectionFactory _dbFactory;

    public ReciclajeRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<int> CreateAsync(SesionReciclaje sesion)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            INSERT INTO sesiones_reciclaje (usuario_id, maquina_id, botellas, puntos, fecha)
            VALUES (@UsuarioId, @MaquinaId, @Botellas, @Puntos, @Fecha)
            RETURNING id";

        return await connection.ExecuteScalarAsync<int>(sql, sesion);
    }

    public async Task<IEnumerable<SesionReciclaje>> GetByUsuarioIdAsync(int usuarioId, int page, int pageSize)
    {
        using var connection = _dbFactory.CreateConnection();
        var offset = (page - 1) * pageSize;
        const string sql = @"
            SELECT * FROM sesiones_reciclaje 
            WHERE usuario_id = @UsuarioId
            ORDER BY fecha DESC
            OFFSET @Offset LIMIT @Limit";

        return await connection.QueryAsync<SesionReciclaje>(sql, new { UsuarioId = usuarioId, Offset = offset, Limit = pageSize });
    }

    public async Task<int> GetCountByUsuarioIdAsync(int usuarioId)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT COUNT(*) FROM sesiones_reciclaje WHERE usuario_id = @UsuarioId";
        return await connection.ExecuteScalarAsync<int>(sql, new { UsuarioId = usuarioId });
    }

    public async Task<IEnumerable<SesionReciclaje>> GetAllAsync(DateTime? desde, DateTime? hasta, int page, int pageSize)
    {
        using var connection = _dbFactory.CreateConnection();
        var offset = (page - 1) * pageSize;
        var sql = @"
            SELECT * FROM sesiones_reciclaje 
            WHERE (@Desde IS NULL OR fecha >= @Desde)
              AND (@Hasta IS NULL OR fecha <= @Hasta)
            ORDER BY fecha DESC
            OFFSET @Offset LIMIT @Limit";

        return await connection.QueryAsync<SesionReciclaje>(sql, new { Desde = desde, Hasta = hasta, Offset = offset, Limit = pageSize });
    }

    public async Task<int> GetTotalBotellasByUsuarioIdAsync(int usuarioId)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT COALESCE(SUM(botellas), 0) FROM sesiones_reciclaje WHERE usuario_id = @UsuarioId";
        return await connection.ExecuteScalarAsync<int>(sql, new { UsuarioId = usuarioId });
    }

    public async Task<decimal> GetTotalPuntosByUsuarioIdAsync(int usuarioId)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT COALESCE(SUM(puntos), 0) FROM sesiones_reciclaje WHERE usuario_id = @UsuarioId";
        return await connection.ExecuteScalarAsync<decimal>(sql, new { UsuarioId = usuarioId });
    }
}