using Back.Entities;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class CompraProductoRepository(FirestoreDb firestoreDb) : Interfaces.ICompraProductoRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("compras_productos");

    public async Task<List<CompraProducto>> ObtenerPorUsuarioIdAsync(string usuarioId)
    {
        var query = _collection.WhereEqualTo("usuario_id", usuarioId);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents
            .Select(d => d.ConvertTo<CompraProducto>())
            .OrderByDescending(c => c.FechaCompra)
            .ToList();
    }

    public async Task<CompraProducto?> ObtenerPorIdAsync(string id)
    {
        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();
        if (!snapshot.Exists) return null;
        return snapshot.ConvertTo<CompraProducto>();
    }

    public async Task GuardarAsync(CompraProducto compra)
    {
        if (string.IsNullOrEmpty(compra.Id))
        {
            compra.Id = Guid.NewGuid().ToString();
        }
        var docRef = _collection.Document(compra.Id);
        await docRef.SetAsync(compra, SetOptions.MergeAll);
    }
}
