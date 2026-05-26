using Back.Repositories;
using Back.Repositories.Interfaces;

namespace Back.Infrastructure;

public static class ServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Repositorios (Scoped: una instancia por request HTTP) ─────────────────────────
        // Añade aquí los repositorios:
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ISesionReciclajeRepository, SesionReciclajeRepository>();
        services.AddScoped<IRecompensaRepository, RecompensaRepository>();

        // ── Servicios de negocio (Scoped) ────────────────────────────────────────────────
        // services.AddScoped<IUsuarioService, UsuarioService>();

        return services;
    }
}