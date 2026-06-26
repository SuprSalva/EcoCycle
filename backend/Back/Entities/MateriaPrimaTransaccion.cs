using Google.Cloud.Firestore;

namespace Back.Entities;

[FirestoreData]
public class MateriaPrimaTransaccion
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty("materia_prima_id")]
    public string MateriaPrimaId { get; set; } = string.Empty;

    [FirestoreProperty("tipo")]
    public string Tipo { get; set; } = "Entrada"; // Entrada o Salida

    [FirestoreProperty("cantidad")]
    public double Cantidad { get; set; }

    [FirestoreProperty("costo_unitario")]
    public double CostoUnitario { get; set; } // Para calcular el promedio

    [FirestoreProperty("fecha")]
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [FirestoreProperty("usuario_id")]
    public string UsuarioId { get; set; } = string.Empty; // Quién registró la transacción
}
