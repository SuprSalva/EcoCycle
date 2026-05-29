using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Infrastructure.Repositories;

public class ReciclajeRepository : IReciclajeRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "sesiones_reciclaje";

    public ReciclajeRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<string> CreateAsync(SesionReciclaje sesion)
    {
        var collection = _firestoreDb.Collection(CollectionName);
        var docRef = collection.Document();
        sesion.Id = docRef.Id;
        sesion.Fecha = DateTime.UtcNow;
        await docRef.SetAsync(sesion);
        return docRef.Id;
    }

    public async Task<IEnumerable<SesionReciclaje>> GetByUsuarioIdAsync(string usuarioId, int page, int pageSize)
    {
        var query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("usuario_id", usuarioId)
            .OrderByDescending("fecha")
            .Offset((page - 1) * pageSize)
            .Limit(pageSize);

        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<SesionReciclaje>());
    }

    public async Task<int> GetCountByUsuarioIdAsync(string usuarioId)
    {
        Query query = _firestoreDb.Collection(CollectionName); if (usuarioId != "0" && !string.IsNullOrEmpty(usuarioId)) query = query.WhereEqualTo("usuario_id", usuarioId);
        var countQuery = query.Count();
        var snapshot = await countQuery.GetSnapshotAsync();
        return (int)snapshot.Count;
    }

    public async Task<IEnumerable<SesionReciclaje>> GetAllAsync(DateTime? desde, DateTime? hasta, int page, int pageSize)
    {
        Query query = _firestoreDb.Collection(CollectionName);

        if (desde.HasValue)
            query = query.WhereGreaterThanOrEqualTo("fecha", desde.Value.ToUniversalTime());
        if (hasta.HasValue)
            query = query.WhereLessThanOrEqualTo("fecha", hasta.Value.ToUniversalTime());

        query = query.OrderByDescending("fecha").Offset((page - 1) * pageSize).Limit(pageSize);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<SesionReciclaje>());
    }

    public async Task<int> GetTotalBotellasByUsuarioIdAsync(string usuarioId)
    {
        Query query = _firestoreDb.Collection(CollectionName); if (usuarioId != "0" && !string.IsNullOrEmpty(usuarioId)) query = query.WhereEqualTo("usuario_id", usuarioId);
        var snapshot = await query.GetSnapshotAsync();
        // Since Firestore lacks SUM aggregations natively, we fetch and sum in memory
        return snapshot.Documents.Sum(d => d.TryGetValue("botellas", out int botellas) ? botellas : 0);
    }

    public async Task<double> GetTotalPuntosByUsuarioIdAsync(string usuarioId)
    {
        Query query = _firestoreDb.Collection(CollectionName); if (usuarioId != "0" && !string.IsNullOrEmpty(usuarioId)) query = query.WhereEqualTo("usuario_id", usuarioId);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Sum(d => d.TryGetValue("puntos", out double puntos) ? puntos : 0.0);
    }
}
