using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class CompraProveedor
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("proveedor_id")]
    public string ProveedorId { get; set; } = string.Empty;

    [FirestoreProperty("proveedor_nombre")]
    public string ProveedorNombre { get; set; } = string.Empty;

    [FirestoreProperty("fecha_compra")]
    public DateTime FechaCompra { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("total")]
    public double Total { get; set; }

    [FirestoreProperty("estado")]
    public string Estado { get; set; } = "Completado"; // Pendiente, Completado, Cancelado

    [FirestoreProperty("detalles")]
    public List<DetalleCompra> Detalles { get; set; } = new List<DetalleCompra>();
}
