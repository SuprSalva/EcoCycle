using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories;

public class UsuarioRepository(FirestoreDb firestoreDb) : IUsuarioRepository
{
    private readonly CollectionReference _collection = firestoreDb.Collection("usuarios");

    public async Task<Usuario?> ObtenerPorIdAsync(string id)
    {
        var docRef = _collection.Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return null;

        var usuario = snapshot.ConvertTo<Usuario>();
        return usuario.Activo ? usuario : null;
    }

    public async Task<Usuario?> ObtenerPorEmailAsync(string email)
    {
        var query = _collection.WhereEqualTo("email", email).WhereEqualTo("activo", true).Limit(1);
        var snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0) return null;

        return snapshot.Documents[0].ConvertTo<Usuario>();
    }

    public async Task GuardarAsync(Usuario usuario)
    {
        var docRef = _collection.Document(usuario.Id);
        await docRef.SetAsync(usuario, SetOptions.MergeAll);
    }

    public async Task<List<Usuario>> ObtenerTodosAsync()
    {
        var query = _collection.WhereEqualTo("activo", true);
        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Usuario>()).ToList();
    }

    public async Task EliminarAsync(string id)
    {
        var docRef = _collection.Document(id);
        await docRef.UpdateAsync("activo", false);
    }
}
