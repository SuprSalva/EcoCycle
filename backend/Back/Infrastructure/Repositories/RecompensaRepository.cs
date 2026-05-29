using Back.Entities;
using Back.Infrastructure.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Infrastructure.Repositories;

public class RecompensaRepository : IRecompensaRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "recompensas";

    public RecompensaRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<Recompensa?> GetByIdAsync(string id)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        var snapshot = await docRef.GetSnapshotAsync();

        if (!snapshot.Exists) return null;

        return snapshot.ConvertTo<Recompensa>();
    }

    public async Task<IEnumerable<Recompensa>> GetAllAsync(bool soloActivas = true)
    {
        Query query = _firestoreDb.Collection(CollectionName);

        if (soloActivas)
        {
            query = query.WhereEqualTo("activa", true);
        }

        var snapshot = await query.GetSnapshotAsync();
        return snapshot.Documents.Select(d => d.ConvertTo<Recompensa>());
    }

    public async Task<string> CreateAsync(Recompensa recompensa)
    {
        var collection = _firestoreDb.Collection(CollectionName);
        var docRef = collection.Document();
        recompensa.Id = docRef.Id;
        await docRef.SetAsync(recompensa);
        return docRef.Id;
    }

    public async Task UpdateAsync(Recompensa recompensa)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(recompensa.Id);
        var updates = new Dictionary<string, object>
        {
            { "nombre", recompensa.Nombre },
            { "descripcion", recompensa.Descripcion },
            { "costo_puntos", recompensa.CostoPuntos },
            { "stock", recompensa.Stock },
            { "activa", recompensa.Activa }
        };
        await docRef.UpdateAsync(updates);
    }

    public async Task DeleteAsync(string id)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        await docRef.DeleteAsync();
    }

    public async Task<bool> UpdateStockAsync(string id, int cantidad)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(id);
        try
        {
            bool success = false;
            await _firestoreDb.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (snapshot.Exists)
                {
                    int currentStock = snapshot.TryGetValue("stock", out int s) ? s : 0;
                    int newStock = currentStock + cantidad;
                    // Note: If stock allows negative like -1 for infinite, we need to adapt logic.
                    // But here we just add the 'cantidad' (which could be negative to decrease stock).
                    if (currentStock >= 0 && newStock < 0 && currentStock != -1)
                    {
                        // Cannot reduce stock below 0 if it's not infinite (-1)
                        success = false;
                    }
                    else
                    {
                        transaction.Update(docRef, "stock", newStock);
                        success = true;
                    }
                }
            });
            return success;
        }
        catch
        {
            return false;
        }
    }
}
