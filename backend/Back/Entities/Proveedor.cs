using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class Proveedor
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [FirestoreProperty("empresa")]
    public string Empresa { get; set; } = string.Empty;

    [FirestoreProperty("telefono")]
    public string Telefono { get; set; } = string.Empty;

    [FirestoreProperty("email")]
    public string Email { get; set; } = string.Empty;

    [FirestoreProperty("direccion")]
    public string Direccion { get; set; } = string.Empty;

    [FirestoreProperty("activo")]
    public bool Activo { get; set; } = true;
}
