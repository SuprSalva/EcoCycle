using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.Entities;
using Dapper;

namespace Back.Infrastructure.Repositories;

public class RecompensaRepository : IRecompensaRepository
{
    private readonly IDbConnectionFactory _dbFactory;

    public RecompensaRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<Recompensa?> GetByIdAsync(int id)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT * FROM recompensas WHERE id = @Id";
        return await connection.QueryFirstOrDefaultAsync<Recompensa>(sql, new { Id = id });
    }

    public async Task<IEnumerable<Recompensa>> GetAllAsync(bool soloActivas = true)
    {
        using var connection = _dbFactory.CreateConnection();
        var sql = "SELECT * FROM recompensas";
        if (soloActivas)
            sql += " WHERE activa = true";
        sql += " ORDER BY costo_puntos ASC";

        return await connection.QueryAsync<Recompensa>(sql);
    }

    public async Task<int> CreateAsync(Recompensa recompensa)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            INSERT INTO recompensas (nombre, descripcion, costo_puntos, stock, activa)
            VALUES (@Nombre, @Descripcion, @CostoPuntos, @Stock, @Activa)
            RETURNING id";

        return await connection.ExecuteScalarAsync<int>(sql, recompensa);
    }

    public async Task UpdateAsync(Recompensa recompensa)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            UPDATE recompensas 
            SET nombre = @Nombre, descripcion = @Descripcion, 
                costo_puntos = @CostoPuntos, stock = @Stock, activa = @Activa
            WHERE id = @Id";

        await connection.ExecuteAsync(sql, recompensa);
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "DELETE FROM recompensas WHERE id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });
    }

    public async Task<bool> UpdateStockAsync(int id, int cantidad)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            UPDATE recompensas 
            SET stock = stock - @Cantidad
            WHERE id = @Id AND (stock = -1 OR stock >= @Cantidad)
            RETURNING 1";

        var result = await connection.ExecuteScalarAsync<int>(sql, new { Id = id, Cantidad = cantidad });
        return result == 1;
    }
}