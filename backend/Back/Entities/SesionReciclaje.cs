using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class SesionReciclaje
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty;

    [FirestoreProperty("maquina_id")]
    public string MaquinaId { get; set; } = string.Empty;

    [FirestoreProperty("botellas")]
    public int Botellas { get; set; }

    [FirestoreProperty("puntos")]
    public double Puntos { get; set; } // Firestore soporta double, no double directamente.

    [FirestoreProperty("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}
