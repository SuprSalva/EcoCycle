using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class SesionReciclajeRepository(FirestoreDb firestoreDb) : ISesionReciclajeRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("sesiones_reciclaje");

    public async Task GuardarAsync(SesionReciclaje sesion)
    {
        var docRef = string.IsNullOrEmpty(sesion.Id) ? _collection.Document() : _collection.Document(sesion.Id);
        sesion.Id = docRef.Id; // Firestore SDK sets the ID
        await docRef.SetAsync(sesion);
    }

    public async Task<List<SesionReciclaje>> ObtenerPorUsuarioAsync(string usuarioId)
    {
        var query = _collection.WhereEqualTo("usuario_id", usuarioId).OrderByDescending("fecha");
        var snapshot = await query.GetSnapshotAsync();
        
        return snapshot.Documents.Select(d => d.ConvertTo<SesionReciclaje>()).ToList();
    }
}
