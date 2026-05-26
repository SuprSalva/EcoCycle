using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.Entities;
using Dapper;

namespace Back.Infrastructure.Repositories;

public class SaldoPuntosRepository : ISaldoPuntosRepository
{
    private readonly IDbConnectionFactory _dbFactory;

    public SaldoPuntosRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<SaldoPuntos?> GetSaldoAsync(int usuarioId)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT * FROM saldo_puntos WHERE usuario_id = @UsuarioId";
        return await connection.QueryFirstOrDefaultAsync<SaldoPuntos>(sql, new { UsuarioId = usuarioId });
    }

    public async Task<bool> AddPuntosAsync(int usuarioId, decimal puntos)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            INSERT INTO saldo_puntos (usuario_id, saldo, actualizado_en)
            VALUES (@UsuarioId, @Puntos, NOW())
            ON CONFLICT (usuario_id) 
            DO UPDATE SET saldo = saldo_puntos.saldo + @Puntos, actualizado_en = NOW()
            RETURNING 1";

        var result = await connection.ExecuteScalarAsync<int>(sql, new { UsuarioId = usuarioId, Puntos = puntos });
        return result == 1;
    }

    public async Task<bool> SubtractPuntosAsync(int usuarioId, decimal puntos)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            UPDATE saldo_puntos 
            SET saldo = saldo - @Puntos, actualizado_en = NOW()
            WHERE usuario_id = @UsuarioId AND saldo >= @Puntos
            RETURNING 1";

        var result = await connection.ExecuteScalarAsync<int>(sql, new { UsuarioId = usuarioId, Puntos = puntos });
        return result == 1;
    }

    public async Task InitializeSaldoAsync(int usuarioId)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            INSERT INTO saldo_puntos (usuario_id, saldo, actualizado_en)
            VALUES (@UsuarioId, 0, NOW())
            ON CONFLICT (usuario_id) DO NOTHING";

        await connection.ExecuteAsync(sql, new { UsuarioId = usuarioId });
    }
}