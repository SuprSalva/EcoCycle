using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;

namespace Back.Entities
{
    [FirestoreData]
    public class Productos
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty]
        public string Nombre { get; set; }

        [FirestoreProperty]
        public string Descripcion { get; set; }

        [FirestoreProperty]
        public string? ImagenUrl { get; set; }

        [FirestoreProperty]
        public bool Activo { get; set; }
}
}