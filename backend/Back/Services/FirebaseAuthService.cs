using System.Net.Http.Json;

namespace Back.Services;

public interface IFirebaseAuthService
{
    /// <summary>
    /// Verifica email y contraseña contra Firebase Authentication
    /// (Identity Toolkit REST API). Devuelve true solo si las credenciales son válidas.
    /// </summary>
    Task<bool> VerificarCredencialesAsync(string email, string password);
}

public class FirebaseAuthService : IFirebaseAuthService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FirebaseAuthService> _logger;

    public FirebaseAuthService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<FirebaseAuthService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> VerificarCredencialesAsync(string email, string password)
    {
        var apiKey = _configuration["Firebase:WebApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            // Sin la key no hay forma de verificar: fallar cerrado.
            _logger.LogError("Firebase:WebApiKey no configurada; se rechaza el login.");
            return false;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("firebase-auth");
            var url = $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={apiKey}";
            using var response = await client.PostAsJsonAsync(url, new
            {
                email,
                password,
                returnSecureToken = true
            });

            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            _logger.LogWarning("Credenciales inválidas para {Email} (HTTP {Status})", email, (int)response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verificando credenciales contra Firebase");
            return false;
        }
    }
}
