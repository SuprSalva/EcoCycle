using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories
{
    public class ComentariosRepository : IComentariosRepository
    {
        private readonly FirestoreDb _firestore;
        private readonly CollectionReference _collection;

        public ComentariosRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
            _collection = _firestore.Collection("comentarios");
        }

        public async Task<string> CrearComentarioAsync(Comentarios comentario)
        {
            DocumentReference doc = await _collection.AddAsync(comentario);
            return doc.Id;
        }

        public async Task<List<Comentarios>> ObtenerComentariosAsync()
        {
            QuerySnapshot snapshot = await _collection.GetSnapshotAsync();
            List<Comentarios> comentarios = new();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Comentarios comentario = document.ConvertTo<Comentarios>();
                    comentario.Id = document.Id;
                    comentarios.Add(comentario);
                }
            }

            return comentarios;
        }

        // 🆕 NUEVO: Obtiene únicamente los comentarios cuya propiedad 'EsPublico' sea true
        public async Task<List<Comentarios>> ObtenerComentariosPublicosAsync()
        {
            // Creamos la consulta filtrando por el campo de Firestore
            Query query = _collection.WhereEqualTo("EsPublico", true);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();
            List<Comentarios> comentarios = new();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Comentarios comentario = document.ConvertTo<Comentarios>();
                    comentario.Id = document.Id;
                    comentarios.Add(comentario);
                }
            }

            return comentarios;
        }

        public async Task<Comentarios?> ObtenerComentarioPorIdAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            DocumentSnapshot snapshot = await documentReference.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            Comentarios comentario = snapshot.ConvertTo<Comentarios>();
            comentario.Id = snapshot.Id;

            return comentario;
        }

        public async Task ActualizarEstatusAsync(string id, string estatus)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.UpdateAsync(new Dictionary<string, object>
            {
                { "Estatus", estatus }
            });
        }

        // 🆕 NUEVO: Modifica de manera rápida la visibilidad de un comentario por su ID
        public async Task CambiarVisibilidadAsync(string id, bool esPublico)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.UpdateAsync(new Dictionary<string, object>
            {
                { "EsPublico", esPublico }
            });
        }

        public async Task ActualizarComentarioAsync(Comentarios comentario)
        {
            if (string.IsNullOrEmpty(comentario.Id))
                throw new ArgumentException("El Id del comentario es requerido.");

            DocumentReference documentReference = _collection.Document(comentario.Id);

            await documentReference.SetAsync(comentario, SetOptions.Overwrite);
        }

        public async Task EliminarComentarioAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.DeleteAsync();
        }
    }
}