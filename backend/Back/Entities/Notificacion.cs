using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class Notificacion
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty;

    [FirestoreProperty("titulo")]
    public string Titulo { get; set; } = string.Empty;

    [FirestoreProperty("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [FirestoreProperty("icono")]
    public string Icono { get; set; } = "Recycling";

    [FirestoreProperty("leida")]
    public bool Leida { get; set; } = false;

    [FirestoreProperty("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
}
