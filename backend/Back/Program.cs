using Back.Infrastructure;
using Back.Infrastructure.Repositories;
using Back.Infrastructure.Repositories.Interfaces;
using Back.Middleware;
using Back.ViewModels;
using Back.ViewModels.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// CONFIGURACIÓN DE SERILOG (LOGS)
// ==========================================
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ==========================================
// AGREGAR SERVICIOS AL CONTENEDOR
// ==========================================

// Configurar OpenAPI (que ya tenías)
builder.Services.AddOpenApi();

// Configurar Swagger (alternativa más completa)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar CORS para Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ==========================================
// CONFIGURACIÓN DE JWT (AUTENTICACIÓN)
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured");
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ==========================================
// REGISTRO DE DEPENDENCIAS - MVVM
// ==========================================

// Infrastructure
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

// Repositories
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<ISaldoPuntosRepository, SaldoPuntosRepository>();
builder.Services.AddScoped<IReciclajeRepository, ReciclajeRepository>();
builder.Services.AddScoped<IRecompensaRepository, RecompensaRepository>();
builder.Services.AddScoped<ICanjeRepository, CanjeRepository>();

// ViewModels (Lógica de negocio)
builder.Services.AddScoped<IAuthViewModel, AuthViewModel>();
builder.Services.AddScoped<IUsuarioViewModel, UsuarioViewModel>();
builder.Services.AddScoped<IReciclajeViewModel, ReciclajeViewModel>();
builder.Services.AddScoped<IRecompensaViewModel, RecompensaViewModel>();

// Validators
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// Agregar controladores
builder.Services.AddControllers();

var app = builder.Build();

// ==========================================
// CONFIGURAR EL PIPELINE DE HTTP REQUEST
// ==========================================

// Middleware de manejo de excepciones (debe ir al inicio)
app.UseMiddleware<ExceptionMiddleware>();

// Configurar OpenAPI/Swagger (lo que ya tenías)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirección HTTPS (lo que ya tenías)
app.UseHttpsRedirection();

// CORS (debe ir antes de autenticación y autorización)
app.UseCors("AllowAngular");

// Autenticación y Autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapeo de controladores (API de EcoCycle)
app.MapControllers();

// ==========================================
// ENDPOINTS EXISTENTES (WeatherForecast)
// ==========================================
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

// ==========================================
// INICIAR LA APLICACIÓN
// ==========================================
app.Run();

// ==========================================
// RECORD DE WEATHERFORECAST (lo que ya tenías)
// ==========================================
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}