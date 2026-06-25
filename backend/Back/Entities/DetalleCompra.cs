using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class DetalleCompra
{
    [FirestoreProperty("recompensa_id")]
    public string RecompensaId { get; set; } = string.Empty;

    [FirestoreProperty("nombre_recompensa")]
    public string NombreRecompensa { get; set; } = string.Empty;

    [FirestoreProperty("cantidad")]
    public int Cantidad { get; set; }

    [FirestoreProperty("precio_unitario")]
    public double PrecioUnitario { get; set; }
}
