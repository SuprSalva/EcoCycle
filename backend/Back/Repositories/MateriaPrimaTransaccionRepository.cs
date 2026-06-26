using Back.Entities;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class MateriaPrimaTransaccionRepository(FirestoreDb firestoreDb) : Interfaces.IMateriaPrimaTransaccionRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("materia_prima_transacciones");

    public async Task<List<MateriaPrimaTransaccion>> ObtenerPorMateriaPrimaIdAsync(string materiaPrimaId)
    {
        var query = _collection.WhereEqualTo("materia_prima_id", materiaPrimaId);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents
            .Select(d => d.ConvertTo<MateriaPrimaTransaccion>())
            .OrderByDescending(t => t.Fecha)
            .ToList();
    }

    public async Task GuardarAsync(MateriaPrimaTransaccion transaccion)
    {
        if (string.IsNullOrEmpty(transaccion.Id))
        {
            transaccion.Id = Guid.NewGuid().ToString();
        }
        var docRef = _collection.Document(transaccion.Id);
        await docRef.SetAsync(transaccion, SetOptions.MergeAll);
    }
}
