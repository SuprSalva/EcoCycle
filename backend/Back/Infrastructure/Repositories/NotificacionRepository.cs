using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Infrastructure.Repositories;

public class NotificacionRepository : INotificacionRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "notificaciones";

    public NotificacionRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<string> CreateAsync(Notificacion notificacion)
    {
        var collection = _firestoreDb.Collection(CollectionName);
        var docRef = collection.Document();
        notificacion.Id = docRef.Id;
        await docRef.SetAsync(notificacion);
        return docRef.Id;
    }

    public async Task<IEnumerable<Notificacion>> GetByUsuarioIdAsync(string usuarioId)
    {
        var query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("usuario_id", usuarioId)
            .OrderByDescending("fecha")
            .Limit(50); // Get last 50 notifications

        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Notificacion>());
    }

    public async Task MarcarComoLeidasAsync(string usuarioId)
    {
        var query = _firestoreDb.Collection(CollectionName)
            .WhereEqualTo("usuario_id", usuarioId)
            .WhereEqualTo("leida", false);

        var snapshot = await query.GetSnapshotAsync();
        
        var batch = _firestoreDb.StartBatch();
        foreach (var doc in snapshot.Documents)
        {
            batch.Update(doc.Reference, "leida", true);
        }
        await batch.CommitAsync();
    }
}
