using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.Entities;
using Dapper;

namespace Back.Infrastructure.Repositories;

public class CanjeRepository : ICanjeRepository
{
    private readonly IDbConnectionFactory _dbFactory;

    public CanjeRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<int> CreateAsync(Canje canje)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            INSERT INTO canjes (usuario_id, recompensa_id, puntos_usados, fecha)
            VALUES (@UsuarioId, @RecompensaId, @PuntosUsados, @Fecha)
            RETURNING id";

        return await connection.ExecuteScalarAsync<int>(sql, canje);
    }

    public async Task<IEnumerable<Canje>> GetByUsuarioIdAsync(int usuarioId, int page, int pageSize)
    {
        using var connection = _dbFactory.CreateConnection();
        var offset = (page - 1) * pageSize;
        const string sql = @"
            SELECT c.*, r.nombre as recompensa_nombre
            FROM canjes c
            JOIN recompensas r ON c.recompensa_id = r.id
            WHERE c.usuario_id = @UsuarioId
            ORDER BY c.fecha DESC
            OFFSET @Offset LIMIT @Limit";

        return await connection.QueryAsync<Canje>(sql, new { UsuarioId = usuarioId, Offset = offset, Limit = pageSize });
    }

    public async Task<int> GetCountByUsuarioIdAsync(int usuarioId)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT COUNT(*) FROM canjes WHERE usuario_id = @UsuarioId";
        return await connection.ExecuteScalarAsync<int>(sql, new { UsuarioId = usuarioId });
    }

    public async Task<IEnumerable<Canje>> GetAllAsync(DateTime? desde, DateTime? hasta)
    {
        using var connection = _dbFactory.CreateConnection();
        var sql = @"
            SELECT c.*, u.nombre, u.apellidos, r.nombre as recompensa_nombre
            FROM canjes c
            JOIN usuarios u ON c.usuario_id = u.id
            JOIN recompensas r ON c.recompensa_id = r.id
            WHERE (@Desde IS NULL OR c.fecha >= @Desde)
              AND (@Hasta IS NULL OR c.fecha <= @Hasta)
            ORDER BY c.fecha DESC";

        return await connection.QueryAsync<Canje>(sql, new { Desde = desde, Hasta = hasta });
    }
}