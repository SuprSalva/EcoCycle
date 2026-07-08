using Google.Cloud.Firestore;
using System;

namespace Back.Entities
{
    [FirestoreData]
    public class Comentarios
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty]
        public string Mensaje { get; set; }

        [FirestoreProperty]
        public string Email { get; set; }

        /// <summary>
        /// Calificación de la experiencia (ej. de 1 a 5 estrellas)
        /// </summary>
        [FirestoreProperty]
        public int Estrellas { get; set; }

        [FirestoreProperty]
        public string Estatus { get; set; }

        [FirestoreProperty]
        public DateTime Fecha { get; set; }

        [FirestoreProperty]
        public bool EsPublico { get; set; }
        
        [FirestoreProperty]
        public string RespuestaAdmin { get; set; } = string.Empty;
    }
}