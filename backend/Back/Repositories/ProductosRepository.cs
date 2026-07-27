using Back.Entities;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Back.Repositories
{
    public class ProductosRepository : IProductosRepository
    {
        private readonly FirestoreDb _firestore;
        private readonly CollectionReference _collection;

        public ProductosRepository(FirestoreDb firestore)
        {
            _firestore = firestore;
            _collection = _firestore.Collection("productos");
        }

        public async Task<string> CrearProductoAsync(Productos producto)
        {
            DocumentReference doc = await _collection.AddAsync(producto);
            return doc.Id;
        }

        public async Task<List<Productos>> ObtenerProductosAsync()
        {
            QuerySnapshot snapshot = await _collection.GetSnapshotAsync();
            List<Productos> productos = new();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                if (document.Exists)
                {
                    Productos producto = document.ConvertTo<Productos>();
                    producto.Id = document.Id;
                    productos.Add(producto);
                }
            }

            return productos;
        }

        public async Task<Productos?> ObtenerProductoPorIdAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            DocumentSnapshot snapshot = await documentReference.GetSnapshotAsync();

            if (!snapshot.Exists)
                return null;

            Productos producto = snapshot.ConvertTo<Productos>();
            producto.Id = snapshot.Id;

            return producto;
        }

        public async Task ActualizarProductoAsync(Productos producto)
        {
            if (string.IsNullOrEmpty(producto.Id))
                throw new ArgumentException("El Id del producto es requerido.");

            DocumentReference documentReference = _collection.Document(producto.Id);

            await documentReference.SetAsync(producto, SetOptions.Overwrite);
        }

        public async Task ActualizarEstatusActivoAsync(string id, bool activo)
        {
            DocumentReference documentReference = _collection.Document(id);

            await documentReference.UpdateAsync(new Dictionary<string, object>
            {
                { "Activo", activo }
            });
        }

        public async Task EliminarProductoAsync(string id)
        {
            DocumentReference documentReference = _collection.Document(id);
            await documentReference.DeleteAsync();
        }
    }
}