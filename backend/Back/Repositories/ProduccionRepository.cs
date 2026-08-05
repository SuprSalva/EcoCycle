using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class ProduccionRepository(FirestoreDb firestoreDb) : IProduccionRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("producciones");

    public async Task<List<Produccion>> ObtenerTodasAsync()
    {
        var snapshot = await _collection.GetSnapshotAsync();
        return snapshot.Documents
            .Select(d => d.ConvertTo<Produccion>())
            .OrderByDescending(p => p.Fecha)
            .ToList();
    }

    public async Task<Produccion?> ObtenerPorIdAsync(string id)
    {
        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();
        return snapshot.Exists ? snapshot.ConvertTo<Produccion>() : null;
    }
}
