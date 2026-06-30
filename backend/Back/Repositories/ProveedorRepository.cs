using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class ProveedorRepository(FirestoreDb firestoreDb) : IProveedorRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("proveedores");

    public async Task<Proveedor?> ObtenerPorIdAsync(string id)
    {
        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return null;

        var proveedor = snapshot.ConvertTo<Proveedor>();
        return proveedor.Activo ? proveedor : null;
    }

    public async Task<List<Proveedor>> ObtenerTodosAsync()
    {
        var query = _collection.WhereEqualTo("activo", true);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Proveedor>()).ToList();
    }

    public async Task GuardarAsync(Proveedor proveedor)
    {
        var docRef = _collection.Document(proveedor.Id);
        await docRef.SetAsync(proveedor, SetOptions.MergeAll);
    }

    public async Task EliminarAsync(string id)
    {
        var docRef = _collection.Document(id);
        await docRef.UpdateAsync("activo", false);
    }
}
