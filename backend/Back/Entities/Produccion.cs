using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class Produccion
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("producto_id")]
    public string ProductoId { get; set; } = string.Empty;

    [FirestoreProperty("nombre_producto")]
    public string NombreProducto { get; set; } = string.Empty;

    [FirestoreProperty("receta_id")]
    public string RecetaId { get; set; } = string.Empty;

    // Unidades de producto fabricadas en esta corrida.
    [FirestoreProperty("cantidad")]
    public double Cantidad { get; set; }

    // Costo total de la materia prima consumida (a costo promedio).
    [FirestoreProperty("costo_total")]
    public double CostoTotal { get; set; }

    [FirestoreProperty("estado")]
    public string Estado { get; set; } = "Completada";

    [FirestoreProperty("observaciones")]
    public string? Observaciones { get; set; }

    [FirestoreProperty("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty;

    [FirestoreProperty("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    // Fotografía de los materiales consumidos, para el historial.
    [FirestoreProperty("materiales_consumidos")]
    public List<MaterialConsumido> MaterialesConsumidos { get; set; } = new();
}

[FirestoreData]
public class MaterialConsumido
{
    [FirestoreProperty("materia_prima_id")]
    public string MateriaPrimaId { get; set; } = string.Empty;

    [FirestoreProperty("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [FirestoreProperty("cantidad")]
    public double Cantidad { get; set; }

    [FirestoreProperty("unidad")]
    public string Unidad { get; set; } = string.Empty;

    [FirestoreProperty("costo_unitario")]
    public double CostoUnitario { get; set; }
}
