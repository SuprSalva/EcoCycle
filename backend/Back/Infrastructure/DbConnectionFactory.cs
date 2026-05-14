using System.Data;
using Npgsql;

namespace Back.Infrastructure;

// ── Interfaz ──────────────────────────────────────────────────────────────────
public interface IDbConnectionFactory
{
    /// <summary>
    /// Crea y devuelve una conexión abierta lista para usar con Dapper.
    /// Úsala siempre dentro de un bloque 'using' para liberar al pool de inmediato.
    /// </summary>
    IDbConnection CreateConnection();
}

// ── Implementación PostgreSQL (Npgsql) ────────────────────────────────────────
public sealed class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public NpgsqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "No se encontró 'DefaultConnection' en appsettings.");
    }

    public IDbConnection CreateConnection()
    {
        var connection = new NpgsqlConnection(_connectionString);
        connection.Open(); // abre aquí para que el repositorio reciba la conexión lista
        return connection;
    }
}