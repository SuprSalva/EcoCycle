using Dapper;
using Back.Entities;
using Back.Infrastructure;
using Back.Repositories.Interfaces;

namespace Back.Repositories;

public class EmpresaRepository(IDbConnectionFactory factory) : IEmpresaRepository
{
    public async Task<IEnumerable<Empresa>> ObtenerTodosAsync()
    {
        using var conn = factory.CreateConnection();
        return await conn.QueryAsync<Empresa>("SELECT * FROM empresas WHERE activo = true");
    }

    public async Task<int> CrearAsync(Empresa empresa)
    {
        using var conn = factory.CreateConnection();
        const string sql = """
            INSERT INTO empresas (nombre, rfc, activo)
            VALUES (@Nombre, @Rfc, true)
            RETURNING id
            """;
        return await conn.ExecuteScalarAsync<int>(sql, empresa);
    }
}