using Google.Cloud.Firestore;
using System;

namespace Back.Entities
{
    [FirestoreData]
    public class Recetas
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty]
        public string ProductoId { get; set; }

        [FirestoreProperty]
        public string NombreProducto { get; set; }

        [FirestoreProperty]
        public string Descripcion { get; set; }

        [FirestoreProperty]
        public int Version { get; set; } = 1;

        [FirestoreProperty]
        public double TiempoEstimadoMinutos { get; set; }

        [FirestoreProperty]
        public bool Activo { get; set; } = true;

        [FirestoreProperty]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    }
}