using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Repositories
{
    public class ReporteRepository : IReporteRepository
    {
        private readonly FirestoreDb _firestore;
        private const string CollectionName = "reportes";

        public ReporteRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
        }

        public async Task<IEnumerable<Reporte>> ObtenerTodosAsync()
        {
            var snapshot = await _firestore
                .Collection(CollectionName)
                .GetSnapshotAsync();

            var reportes = new List<Reporte>();

            foreach (var document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    var reporte = document.ConvertTo<Reporte>();
                    reporte.Id = document.Id;
                    reportes.Add(reporte);
                }
            }

            return reportes;
        }

        public async Task<Reporte?> ObtenerPorIdAsync(string id)
        {
            var document = await _firestore
                .Collection(CollectionName)
                .Document(id)
                .GetSnapshotAsync();

            if (!document.Exists)
                return null;

            var reporte = document.ConvertTo<Reporte>();
            reporte.Id = document.Id;

            return reporte;
        }

        public async Task CrearAsync(Reporte reporte)
        {
            var docRef = _firestore.Collection(CollectionName).Document();

            reporte.Id = docRef.Id;

            await docRef.SetAsync(reporte);
        }

        public async Task ActualizarAsync(string id, Reporte reporte)
        {
            await _firestore
                .Collection(CollectionName)
                .Document(id)
                .SetAsync(reporte, SetOptions.Overwrite);
        }

        public async Task EliminarAsync(string id)
        {
            await _firestore
                .Collection(CollectionName)
                .Document(id)
                .DeleteAsync();
        }
    }
}