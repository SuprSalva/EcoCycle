using Back.Entities;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class MateriaPrimaRepository(FirestoreDb firestoreDb) : Interfaces.IMateriaPrimaRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("materia_prima");

    public async Task<MateriaPrima?> ObtenerPorIdAsync(string id)
    {
        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return null;

        var mp = snapshot.ConvertTo<MateriaPrima>();
        return mp.Activo ? mp : null;
    }

    public async Task<MateriaPrima?> ObtenerPorNombreAsync(string nombre)
    {
        var normalizedNombre = nombre.Trim().ToLowerInvariant();
        var query = _collection.WhereEqualTo("activo", true);
        var snapshot = await query.GetSnapshotAsync();
        
        var mp = snapshot.Documents
            .Select(d => d.ConvertTo<MateriaPrima>())
            .FirstOrDefault(m => m.Nombre.Trim().ToLowerInvariant() == normalizedNombre);
            
        return mp;
    }

    public async Task<List<MateriaPrima>> ObtenerTodasAsync()
    {
        var query = _collection.WhereEqualTo("activo", true);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<MateriaPrima>()).ToList();
    }

    public async Task GuardarAsync(MateriaPrima materiaPrima)
    {
        if (string.IsNullOrEmpty(materiaPrima.Id))
        {
            materiaPrima.Id = Guid.NewGuid().ToString();
        }
        var docRef = _collection.Document(materiaPrima.Id);
        await docRef.SetAsync(materiaPrima, SetOptions.MergeAll);
    }

    public async Task EliminarAsync(string id)
    {
        var docRef = _collection.Document(id);
        await docRef.UpdateAsync("activo", false);
    }
}
