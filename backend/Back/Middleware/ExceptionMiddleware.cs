using System.Net;
using System.Text.Json;
using Back.Wrappers;

namespace Back.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.Fail("Ocurrió un error interno. Intente más tarde.");
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
