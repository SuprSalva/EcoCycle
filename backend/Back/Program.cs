using Google.Cloud.Firestore;
using Back.Repositories;
using Back.Repositories.Interfaces;
using Back.ViewModels;
using Back.ViewModels.Interfaces;
using Back.Middleware;
using FluentValidation;
using Back.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Reflection;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

var firebaseProjectId = builder.Configuration["Firestore:ProjectId"];
if (string.IsNullOrEmpty(firebaseProjectId))
{
    throw new Exception("Firestore:ProjectId is missing from configuration.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var firestoreKeyPath = builder.Configuration["Firestore:KeyPath"];
string credentialsPath = null;
if (!string.IsNullOrEmpty(firestoreKeyPath))
{
    credentialsPath = Path.Combine(AppContext.BaseDirectory, firestoreKeyPath);
    if (!File.Exists(credentialsPath))
    {
        credentialsPath = Path.GetFullPath(firestoreKeyPath);
    }

    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
}

var firestoreDb = new Google.Cloud.Firestore.FirestoreDbBuilder
{
    ProjectId = firebaseProjectId,
    CredentialsPath = credentialsPath
}.Build();
builder.Services.AddSingleton(firestoreDb);

builder.Services.AddScoped<Back.Repositories.Interfaces.IUsuarioRepository, Back.Repositories.UsuarioRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.ISesionReciclajeRepository, Back.Repositories.SesionReciclajeRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.IRecompensaRepository, Back.Repositories.RecompensaRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.IProveedorRepository, Back.Repositories.ProveedorRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.ICompraProveedorRepository, Back.Repositories.CompraProveedorRepository>();
builder.Services.AddScoped<IReporteRepository, ReporteRepository>();
builder.Services.AddScoped<ICotizacionRepository, CotizacionRepository>();
builder.Services.AddScoped<IProductosRepository, ProductosRepository>();
builder.Services.AddScoped<IRecetasRepository, RecetasRepository>();
builder.Services.AddScoped<IRecetasDetalleRepository, RecetasDetalleRepository>();
builder.Services.AddScoped<INotificacionRepository, NotificacionRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.IMateriaPrimaRepository, Back.Repositories.MateriaPrimaRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.IMateriaPrimaTransaccionRepository, Back.Repositories.MateriaPrimaTransaccionRepository>();
builder.Services.AddScoped<Back.Repositories.Interfaces.ICompraProductoRepository, Back.Repositories.CompraProductoRepository>();
builder.Services.AddScoped<IComentariosRepository, ComentariosRepository>();
builder.Services.AddScoped<INotificacionViewModel, NotificacionViewModel>();

builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// ==========================================
// CONFIGURAR OPENAPI/SWAGGER Y CORS
// ==========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IPdfGeneratorService, PdfGeneratorService>();
builder.Services.AddScoped<IFirebaseAuthService, FirebaseAuthService>();
builder.Services.AddScoped<ProductosService>();

// Orígenes permitidos configurables (appsettings/variable de entorno, separados por coma)
var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:4200")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate limiting para endpoints sensibles (login): 10 intentos por minuto por IP
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// Respetar X-Forwarded-For / X-Forwarded-Proto cuando corre detrás de nginx
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

// ==========================================
// CONFIGURAR EL PIPELINE DE HTTP REQUEST
// ==========================================
app.UseForwardedHeaders();
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
