using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class CompraProveedorRepository(FirestoreDb firestoreDb) : ICompraProveedorRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("compras_proveedores");

    public async Task<CompraProveedor?> ObtenerPorIdAsync(string id)
    {
        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return null;

        return snapshot.ConvertTo<CompraProveedor>();
    }

    public async Task<List<CompraProveedor>> ObtenerTodasAsync()
    {
        var snapshot = await _collection.OrderByDescending("fecha_compra").GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<CompraProveedor>()).ToList();
    }

    public async Task GuardarAsync(CompraProveedor compra)
    {
        var docRef = string.IsNullOrEmpty(compra.Id) ? _collection.Document() : _collection.Document(compra.Id);
        compra.Id = docRef.Id;
        await docRef.SetAsync(compra, SetOptions.MergeAll);
    }
}
