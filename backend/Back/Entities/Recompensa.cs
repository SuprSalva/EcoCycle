using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class Recompensa
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [FirestoreProperty("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [FirestoreProperty("costo_puntos")]
    public double CostoPuntos { get; set; }

    [FirestoreProperty("stock")]
    public int Stock { get; set; }

    [FirestoreProperty("activa")]
    public bool Activa { get; set; } = true;
}
