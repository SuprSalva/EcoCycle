using Google.Cloud.Firestore;
using Back.Repositories;
using Back.Repositories.Interfaces;
using Back.Middleware;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Reflection;

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
// CONFIGURAR AUTENTICACIÓN (FIREBASE JWT)
// ==========================================
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

// ==========================================
// CONFIGURAR FIRESTORE
// ==========================================
var firestoreKeyPath = builder.Configuration["Firestore:KeyPath"];
if (!string.IsNullOrEmpty(firestoreKeyPath))
{
    var credentialsPath = Path.Combine(AppContext.BaseDirectory, firestoreKeyPath);
    if (!File.Exists(credentialsPath))
    {
        credentialsPath = Path.GetFullPath(firestoreKeyPath);
    }

    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);
}
var firestoreDb = FirestoreDb.Create(firebaseProjectId);
builder.Services.AddSingleton(firestoreDb);

// ==========================================
// SERVICIOS Y REPOSITORIOS
// ==========================================
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<ISesionReciclajeRepository, SesionReciclajeRepository>();
builder.Services.AddScoped<IRecompensaRepository, RecompensaRepository>();
builder.Services.AddScoped<ICanjeRepository, CanjeRepository>();
builder.Services.AddScoped<INotificacionRepository, NotificacionRepository>();

// ViewModels
builder.Services.AddScoped<IAuthViewModel, AuthViewModel>();
builder.Services.AddScoped<IUsuarioViewModel, UsuarioViewModel>();
builder.Services.AddScoped<IReciclajeViewModel, ReciclajeViewModel>();
builder.Services.AddScoped<IRecompensaViewModel, RecompensaViewModel>();
builder.Services.AddScoped<INotificacionViewModel, NotificacionViewModel>();

// Validators
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// ==========================================
// CONFIGURAR OPENAPI/SWAGGER Y CORS
// ==========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

var app = builder.Build();

// ==========================================
// CONFIGURAR EL PIPELINE DE HTTP REQUEST
// ==========================================
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
