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
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
