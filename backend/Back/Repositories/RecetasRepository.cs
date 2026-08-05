using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories
{
    public class RecetasRepository : IRecetasRepository
    {
        private readonly FirestoreDb _firestore;
        private readonly CollectionReference _collection;

        public RecetasRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
            _collection = _firestore.Collection("recetas");
        }

        public async Task<string> CrearRecetaAsync(Recetas receta)
        {
            DocumentReference doc = await _collection.AddAsync(receta);
            return doc.Id;
        }

        public async Task<List<Recetas>> ObtenerRecetasAsync()
        {
            QuerySnapshot snapshot = await _collection.GetSnapshotAsync();
            List<Recetas> recetas = new();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Recetas receta = document.ConvertTo<Recetas>();
                    receta.Id = document.Id;
                    recetas.Add(receta);
                }
            }

            return recetas;
        }

        public async Task<Recetas?> ObtenerRecetaPorIdAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            DocumentSnapshot snapshot = await documentReference.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            Recetas receta = snapshot.ConvertTo<Recetas>();
            receta.Id = snapshot.Id;

            return receta;
        }

        public async Task ActualizarRecetaAsync(Recetas receta)
        {
            if (string.IsNullOrEmpty(receta.Id))
                throw new ArgumentException("El Id de la receta es requerido.");

            DocumentReference documentReference = _collection.Document(receta.Id);

            await documentReference.SetAsync(receta, SetOptions.Overwrite);
        }

        public async Task ActualizarEstatusActivoAsync(string id, bool activo)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.UpdateAsync(new Dictionary<string, object>
            {
                { "Activo", activo }
            });
        }

        public async Task<Recetas?> ObtenerPorProductoIdAsync(string productoId)
        {
            Query query = _collection.WhereEqualTo("ProductoId", productoId);

            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            if (snapshot.Documents.Count == 0)
                return null;

            var document = snapshot.Documents.First();

            Recetas receta = document.ConvertTo<Recetas>();
            receta.Id = document.Id;

            return receta;
        }

        public async Task EliminarRecetaAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            await documentReference.DeleteAsync();
        }
    }
}