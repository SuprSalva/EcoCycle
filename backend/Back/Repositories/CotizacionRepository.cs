using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories
{
    public class CotizacionRepository : ICotizacionRepository
    {
        private readonly FirestoreDb _firestore;
        private readonly CollectionReference _collection;

        public CotizacionRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
            _collection = _firestore.Collection("cotizaciones");
        }

        public async Task<string> CrearCotizacionAsync(Cotizacion cotizacion)
        {
            DocumentReference doc = await _collection.AddAsync(cotizacion);
            return doc.Id;
        }

        public async Task<List<Cotizacion>> ObtenerCotizacionesAsync()
        {
            QuerySnapshot snapshot = await _collection.GetSnapshotAsync();
            List<Cotizacion> cotizaciones = new();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Cotizacion cotizacion = document.ConvertTo<Cotizacion>();
                    cotizacion.Id = document.Id;
                    cotizaciones.Add(cotizacion);
                }
            }

            return cotizaciones;
        }

        public async Task<Cotizacion?> ObtenerCotizacionPorIdAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            DocumentSnapshot snapshot = await documentReference.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            Cotizacion cotizacion = snapshot.ConvertTo<Cotizacion>();
            cotizacion.Id = snapshot.Id;

            return cotizacion;
        }

        public async Task ActualizarEstatusAsync(string id, string estatus)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.UpdateAsync(new Dictionary<string, object>
            {
                { "Estatus", estatus }
            });
        }

        public async Task ActualizarCotizacionAsync(Cotizacion cotizacion)
        {
            if (string.IsNullOrEmpty(cotizacion.Id))
                throw new ArgumentException("El Id de la cotización es requerido.");

            DocumentReference documentReference = _collection.Document(cotizacion.Id);

            await documentReference.SetAsync(cotizacion, SetOptions.Overwrite);
        }

        public async Task EliminarCotizacionAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.DeleteAsync();
        }
    }
}