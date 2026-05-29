using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "usuarios";

    public UsuarioRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<Usuario?> GetByEmailAsync(string email)
    {
        var query = _firestoreDb.Collection(CollectionName).WhereEqualTo("email", email);
        var snapshot = await query.GetSnapshotAsync();

        if (snapshot.Documents.Count == 0) return null;

        return snapshot.Documents[0].ConvertTo<Usuario>();
    }

    public async Task<Usuario?> GetByIdAsync(string id)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return null;

        return snapshot.ConvertTo<Usuario>();
    }

    public async Task<string> CreateAsync(Usuario usuario)
    {
        var collection = _firestoreDb.Collection(CollectionName);
        var docRef = collection.Document(); // Auto-generate ID
        usuario.Id = docRef.Id;
        await docRef.SetAsync(usuario);
        return docRef.Id;
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(usuario.Id);
        var updates = new Dictionary<string, object>
        {
            { "nombre", usuario.Nombre },
            { "apellidos", usuario.Apellidos },
            { "telefono", usuario.Telefono },
            { "direccion", usuario.Direccion ?? "" }
        };
        await docRef.UpdateAsync(updates);
    }

    public async Task UpdatePasswordAsync(string id, string newPasswordHash)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        await docRef.UpdateAsync("password_hash", newPasswordHash);
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync(int page, int pageSize, string? rol = null)
    {
        Query query = _firestoreDb.Collection(CollectionName);

        if (!string.IsNullOrEmpty(rol))
        {
            query = query.WhereEqualTo("rol", rol);
        }

        query = query.Offset((page - 1) * pageSize).Limit(pageSize);

        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Usuario>());
    }

    public async Task<int> GetTotalCountAsync(string? rol = null)
    {
        Query query = _firestoreDb.Collection(CollectionName);

        if (!string.IsNullOrEmpty(rol))
        {
            query = query.WhereEqualTo("rol", rol);
        }

        var countQuery = query.Count();
        var snapshot = await countQuery.GetSnapshotAsync();
        return (int)snapshot.Count;
    }

    public async Task<bool> ExistsEmailAsync(string email)
    {
        var user = await GetByEmailAsync(email);
        return user != null;
    }

    public async Task<bool> ExistsByIdAsync(string id)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();
        return snapshot.Exists;
    }

    public async Task DeleteAsync(string id)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        await docRef.DeleteAsync();
    }
}
