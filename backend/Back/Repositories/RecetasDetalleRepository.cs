using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories
{
    public class RecetasDetalleRepository : IRecetasDetalleRepository
    {
        private readonly FirestoreDb _firestore;
        private readonly CollectionReference _collection;

        public RecetasDetalleRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
            _collection = _firestore.Collection("recetas_detalle");
        }

        public async Task<string> CrearDetalleAsync(RecetasDetalle detalle)
        {
            DocumentReference doc = await _collection.AddAsync(detalle);
            return doc.Id;
        }

        public async Task<List<RecetasDetalle>> ObtenerDetallesPorRecetaIdAsync(string recetaId)
        {
            Query query = _collection.WhereEqualTo("RecetaId", recetaId);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();
            List<RecetasDetalle> detalles = new();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    RecetasDetalle detalle = document.ConvertTo<RecetasDetalle>();
                    detalle.Id = document.Id;
                    detalles.Add(detalle);
                }
            }

            return detalles;
        }

        public async Task<RecetasDetalle?> ObtenerDetallePorIdAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            DocumentSnapshot snapshot = await documentReference.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            RecetasDetalle detalle = snapshot.ConvertTo<RecetasDetalle>();
            detalle.Id = snapshot.Id;

            return detalle;
        }

        public async Task ActualizarDetalleAsync(RecetasDetalle detalle)
        {
            if (string.IsNullOrEmpty(detalle.Id))
                throw new ArgumentException("El Id del detalle es requerido.");

            DocumentReference documentReference = _collection.Document(detalle.Id);
            await documentReference.SetAsync(detalle, SetOptions.Overwrite);
        }

        public async Task EliminarDetalleAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            await documentReference.DeleteAsync();
        }
    }
}