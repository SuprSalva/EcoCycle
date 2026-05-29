using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Infrastructure.Repositories;

public class CanjeRepository : ICanjeRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "canjes";

    public CanjeRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<string> CreateAsync(Canje canje)
    {
        var collection = _firestoreDb.Collection(CollectionName);
        var docRef = collection.Document();
        canje.Id = docRef.Id;
        canje.Fecha = DateTime.UtcNow;
        await docRef.SetAsync(canje);
        return docRef.Id;
    }

    public async Task<IEnumerable<Canje>> GetByUsuarioIdAsync(string usuarioId, int page, int pageSize)
    {
        var query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("usuario_id", usuarioId)
            .OrderByDescending("fecha")
            .Offset((page - 1) * pageSize)
            .Limit(pageSize);

        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Canje>());
    }

    public async Task<int> GetCountByUsuarioIdAsync(string usuarioId)
    {
        var query = _firestoreDb.Collection(CollectionName).WhereEqualTo("usuario_id", usuarioId);
        var countQuery = query.Count();
        var snapshot = await countQuery.GetSnapshotAsync();
        return (int)snapshot.Count;
    }

    public async Task<IEnumerable<Canje>> GetAllAsync(DateTime? desde, DateTime? hasta)
    {
        Query query = _firestoreDb.Collection(CollectionName);

        if (desde.HasValue)
            query = query.WhereGreaterThanOrEqualTo("fecha", desde.Value.ToUniversalTime());
        if (hasta.HasValue)
            query = query.WhereLessThanOrEqualTo("fecha", hasta.Value.ToUniversalTime());

        query = query.OrderByDescending("fecha");
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Canje>());
    }
}
