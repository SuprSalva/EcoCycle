using System.Security.Cryptography;
using System.Text;
using Back.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Back.Auth;

/// <summary>
/// Protege endpoints usados por dispositivos IoT (máquina recicladora, ESP32)
/// exigiendo la cabecera X-Api-Key igual a MACHINE_API_KEY.
/// Si MACHINE_API_KEY no está configurada, deja pasar (modo desarrollo) y
/// registra una advertencia para no romper entornos locales.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class MachineApiKeyAttribute : TypeFilterAttribute
{
    public MachineApiKeyAttribute() : base(typeof(MachineApiKeyFilter)) { }

    private class MachineApiKeyFilter : IAuthorizationFilter
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<MachineApiKeyFilter> _logger;

        public MachineApiKeyFilter(IConfiguration configuration, ILogger<MachineApiKeyFilter> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Un usuario autenticado con JWT (p. ej. la terminal web) también puede usar el endpoint.
            if (context.HttpContext.User.Identity?.IsAuthenticated == true)
            {
                return;
            }

            var expected = _configuration["MACHINE_API_KEY"] ?? _configuration["MachineApiKey"];
            if (string.IsNullOrEmpty(expected))
            {
                _logger.LogWarning("MACHINE_API_KEY no configurada: endpoint de máquina sin protección (solo aceptable en desarrollo).");
                return;
            }

            var provided = context.HttpContext.Request.Headers["X-Api-Key"].FirstOrDefault() ?? string.Empty;
            var expectedBytes = Encoding.UTF8.GetBytes(expected);
            var providedBytes = Encoding.UTF8.GetBytes(provided);
            var valid = expectedBytes.Length == providedBytes.Length
                        && CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);

            if (!valid)
            {
                context.Result = new UnauthorizedObjectResult(ApiResponse<object>.Fail("API key inválida."));
            }
        }
    }
}
