using Back.Infrastructure.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Infrastructure.Repositories;

public class SaldoPuntosRepository : ISaldoPuntosRepository
{
    private readonly FirestoreDb _firestoreDb;
    private const string CollectionName = "usuarios";

    public SaldoPuntosRepository(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    public async Task<double> GetSaldoAsync(string usuarioId)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(usuarioId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (snapshot.Exists && snapshot.TryGetValue("saldo_puntos", out double saldo))
        {
            return saldo;
        }
        return 0.0;
    }

    public async Task<bool> AddPuntosAsync(string usuarioId, double puntos)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(usuarioId);

        try
        {
            await _firestoreDb.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (snapshot.Exists)
                {
                    double currentSaldo = snapshot.TryGetValue("saldo_puntos", out double s) ? s : 0.0;
                    transaction.Update(docRef, "saldo_puntos", currentSaldo + puntos);
                }
            });
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SubtractPuntosAsync(string usuarioId, double puntos)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(usuarioId);

        try
        {
            bool success = false;
            await _firestoreDb.RunTransactionAsync(async transaction =>
            {
                var snapshot = await transaction.GetSnapshotAsync(docRef);
                if (snapshot.Exists)
                {
                    double currentSaldo = snapshot.TryGetValue("saldo_puntos", out double s) ? s : 0.0;
                    if (currentSaldo >= puntos)
                    {
                        transaction.Update(docRef, "saldo_puntos", currentSaldo - puntos);
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

    public async Task InitializeSaldoAsync(string usuarioId)
    {
        var docRef = _firestoreDb.Collection(CollectionName).Document(usuarioId);
        var snapshot = await docRef.GetSnapshotAsync();

        if (snapshot.Exists && !snapshot.ContainsField("saldo_puntos"))
        {
            await docRef.UpdateAsync("saldo_puntos", 0.0);
        }
    }
}
