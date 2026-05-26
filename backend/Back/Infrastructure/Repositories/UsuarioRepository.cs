using Back.Infrastructure.Repositories.Interfaces;
using Back.Models.Entities;
using Dapper;

namespace Back.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly IDbConnectionFactory _dbFactory;

    public UsuarioRepository(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT * FROM usuarios WHERE email = @Email";
        return await connection.QueryFirstOrDefaultAsync<Usuario>(sql, new { Email = email });
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT * FROM usuarios WHERE id = @Id";
        return await connection.QueryFirstOrDefaultAsync<Usuario>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(Usuario usuario)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            INSERT INTO usuarios (nombre, apellidos, telefono, email, password_hash, direccion, rol, activo)
            VALUES (@Nombre, @Apellidos, @Telefono, @Email, @PasswordHash, @Direccion, @Rol, @Activo)
            RETURNING id";

        return await connection.ExecuteScalarAsync<int>(sql, usuario);
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = @"
            UPDATE usuarios 
            SET nombre = @Nombre, apellidos = @Apellidos, telefono = @Telefono, 
                direccion = @Direccion
            WHERE id = @Id";

        await connection.ExecuteAsync(sql, usuario);
    }

    public async Task UpdatePasswordAsync(int id, string newPasswordHash)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "UPDATE usuarios SET password_hash = @NewPasswordHash WHERE id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id, NewPasswordHash = newPasswordHash });
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync(int page, int pageSize, string? rol = null)
    {
        using var connection = _dbFactory.CreateConnection();
        var offset = (page - 1) * pageSize;

        var sql = @"
            SELECT * FROM usuarios 
            WHERE (@Rol IS NULL OR rol = @Rol)
            ORDER BY id 
            OFFSET @Offset LIMIT @Limit";

        return await connection.QueryAsync<Usuario>(sql, new { Rol = rol, Offset = offset, Limit = pageSize });
    }

    public async Task<int> GetTotalCountAsync(string? rol = null)
    {
        using var connection = _dbFactory.CreateConnection();
        var sql = "SELECT COUNT(*) FROM usuarios WHERE (@Rol IS NULL OR rol = @Rol)";
        return await connection.ExecuteScalarAsync<int>(sql, new { Rol = rol });
    }

    public async Task<bool> ExistsEmailAsync(string email)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT COUNT(1) FROM usuarios WHERE email = @Email";
        return await connection.ExecuteScalarAsync<int>(sql, new { Email = email }) > 0;
    }

    public async Task<bool> ExistsByIdAsync(int id)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "SELECT COUNT(1) FROM usuarios WHERE id = @Id";
        return await connection.ExecuteScalarAsync<int>(sql, new { Id = id }) > 0;
    }

    public async Task DeleteAsync(int id)
    {
        using var connection = _dbFactory.CreateConnection();
        const string sql = "DELETE FROM usuarios WHERE id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });
    }
}