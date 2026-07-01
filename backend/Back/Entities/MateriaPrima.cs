using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class MateriaPrima
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [FirestoreProperty("unidad")]
    public string Unidad { get; set; } = string.Empty; // kg, litros, etc.

    [FirestoreProperty("stock_actual")]
    public double StockActual { get; set; } = 0.0;

    [FirestoreProperty("costo_promedio_unitario")]
    public double CostoPromedioUnitario { get; set; } = 0.0; // Costeo Promedio

    [FirestoreProperty("ultima_actualizacion")]
    public DateTime UltimaActualizacion { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("activo")]
    public bool Activo { get; set; } = true;
}
