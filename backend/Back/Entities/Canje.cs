using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class Canje
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty;

    [FirestoreProperty("recompensa_id")]
    public string RecompensaId { get; set; } = string.Empty;

    [FirestoreProperty("puntos_usados")]
    public double PuntosUsados { get; set; }

    [FirestoreProperty("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}
