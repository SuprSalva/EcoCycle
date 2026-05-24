using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class RecompensaRepository(FirestoreDb firestoreDb) : IRecompensaRepository
{
    private readonly CollectionReference _recompensas = firestoreDb.Collection("recompensas");
    private readonly CollectionReference _canjes = firestoreDb.Collection("canjes");

    public async Task<List<Recompensa>> ObtenerActivasAsync()
    {
        var query = _recompensas.WhereEqualTo("activa", true);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Recompensa>()).ToList();
    }

    public async Task<Recompensa?> ObtenerPorIdAsync(string id)
    {
        var doc = await _recompensas.Document(id).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<Recompensa>() : null;
    }

    public async Task GuardarAsync(Recompensa recompensa)
    {
        var docRef = string.IsNullOrEmpty(recompensa.Id) ? _recompensas.Document() : _recompensas.Document(recompensa.Id);
        recompensa.Id = docRef.Id;
        await docRef.SetAsync(recompensa, SetOptions.MergeAll);
    }

    public async Task RegistrarCanjeAsync(Canje canje)
    {
        var docRef = _canjes.Document();
        canje.Id = docRef.Id;
        await docRef.SetAsync(canje);
    }

    public async Task<List<Canje>> ObtenerCanjesPorUsuarioAsync(string userId)
    {
        var query = _canjes.WhereEqualTo("usuario_id", userId);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Canje>()).ToList();
    }
}
