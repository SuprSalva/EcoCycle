<<<<<<< HEAD
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
=======
using Google.Cloud.Firestore;
using Back.Infrastructure;
using Back.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Configurar Autenticación (Firebase JWT)
var firebaseProjectId = builder.Configuration["Firestore:ProjectId"];
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

// Agregar Controladores
builder.Services.AddControllers();

// Configurar Firestore
var firestoreKeyPath = builder.Configuration["Firestore:KeyPath"];
if (!string.IsNullOrEmpty(firebaseProjectId) && !string.IsNullOrEmpty(firestoreKeyPath))
{
    var credentialsPath = Path.Combine(AppContext.BaseDirectory, firestoreKeyPath);
    if (!File.Exists(credentialsPath))
    {
        credentialsPath = Path.GetFullPath(firestoreKeyPath);
    }
    
    // Método oficial para evitar warnings
    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
    var firestoreDb = FirestoreDb.Create(firebaseProjectId);
    builder.Services.AddSingleton(firestoreDb);
}

// Configurar Infraestructura (Repositorios, Servicios)
builder.Services.AddInfrastructure(builder.Configuration);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
>>>>>>> e9baa1e4074ac01438e712f11fa2184c27ce8485
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

<<<<<<< HEAD
// ==========================================
// CONFIGURAR EL PIPELINE DE HTTP REQUEST
// ==========================================

// Middleware de manejo de excepciones (debe ir al inicio)
app.UseMiddleware<ExceptionMiddleware>();

// Configurar OpenAPI/Swagger (lo que ya tenías)
=======
// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

>>>>>>> e9baa1e4074ac01438e712f11fa2184c27ce8485
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirección HTTPS (lo que ya tenías)
app.UseHttpsRedirection();

<<<<<<< HEAD
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
=======
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
>>>>>>> e9baa1e4074ac01438e712f11fa2184c27ce8485

// ==========================================
// INICIAR LA APLICACIÓN
// ==========================================
app.Run();
<<<<<<< HEAD

// ==========================================
// RECORD DE WEATHERFORECAST (lo que ya tenías)
// ==========================================
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
=======
>>>>>>> e9baa1e4074ac01438e712f11fa2184c27ce8485
