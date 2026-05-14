using Back.Repositories;
using Back.Repositories.Interfaces;
using Back.Services;
using Back.Services.Interfaces;

namespace Back.Infrastructure;

public static class ServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Fábrica de conexiones (Singleton: un factory, conexiones individuales por repo) ──
        services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();

        // ── Repositorios (Scoped: una instancia por request HTTP) ─────────────────────────
        services.AddScoped<IEmpresaRepository, EmpresaRepository>();
        // Añade aquí los demás repositorios:
        // services.AddScoped<IUsuarioRepository, UsuarioRepository>();

        // ── Servicios de negocio (Scoped) ────────────────────────────────────────────────
        services.AddScoped<IEmpresaService, EmpresaService>();
        // services.AddScoped<IUsuarioService, UsuarioService>();

        return services;
    }
}