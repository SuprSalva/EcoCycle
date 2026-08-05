using System.Security.Claims;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Back.Auth;

/// <summary>
/// Restringe el endpoint a usuarios cuyo rol en Firestore sea "admin"/"administrador".
/// Requiere que el usuario ya esté autenticado con JWT de Firebase ([Authorize]).
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminOnlyAttribute : TypeFilterAttribute
{
    public AdminOnlyAttribute() : base(typeof(AdminOnlyFilter)) { }

    private class AdminOnlyFilter : IAsyncAuthorizationFilter
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public AdminOnlyFilter(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user.Identity?.IsAuthenticated != true)
            {
                context.Result = new UnauthorizedObjectResult(ApiResponse<object>.Fail("No autenticado."));
                return;
            }

            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? user.FindFirst("user_id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                context.Result = new UnauthorizedObjectResult(ApiResponse<object>.Fail("Token inválido."));
                return;
            }

            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            var rol = usuario?.Rol?.ToLowerInvariant();
            var esAdmin = usuario is { Activo: true } && (rol == "admin" || rol == "administrador");
            if (!esAdmin)
            {
                context.Result = new ObjectResult(ApiResponse<object>.Fail("Acceso restringido a administradores."))
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
            }
        }
    }
}
