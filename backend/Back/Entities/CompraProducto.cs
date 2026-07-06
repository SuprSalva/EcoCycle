// 📁 Back/Entities/CompraProducto.cs
using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class CompraProducto
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty;

    [FirestoreProperty("nombre_producto")]
    public string NombreProducto { get; set; } = string.Empty;

    [FirestoreProperty("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [FirestoreProperty("fecha_compra")]
    public DateTime FechaCompra { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("precio_total")]
    public double PrecioTotal { get; set; }

    [FirestoreProperty("manual_url")]
    public string ManualUrl { get; set; } = string.Empty;

    [FirestoreProperty("opinion")]
    public string Opinion { get; set; } = string.Empty;

    [FirestoreProperty("calificacion")]
    public int Calificacion { get; set; } = 0;

    // ✅ AGREGADO - SIN DUPLICADOS
    [FirestoreProperty("estado")]
    public string Estado { get; set; } = "Pendiente";
}