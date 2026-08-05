using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class Usuario
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [FirestoreProperty("apellidos")]
    public string Apellidos { get; set; } = string.Empty;

    [FirestoreProperty("telefono")]
    public string Telefono { get; set; } = string.Empty;

    [FirestoreProperty("email")]
    public string Email { get; set; } = string.Empty;

    [FirestoreProperty("direccion")]
    public string? Direccion { get; set; }

    [FirestoreProperty("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [FirestoreProperty("rol")]
    public string Rol { get; set; } = "usuario";

    [FirestoreProperty("activo")]
    public bool Activo { get; set; } = true;

    [FirestoreProperty("saldo_puntos")]
    public double SaldoPuntos { get; set; } = 0.0;

    [FirestoreProperty("creado_en")]
    public DateTime CreadoEn { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("avatar_url")]
    public string? AvatarUrl { get; set; }
}
