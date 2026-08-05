using Google.Cloud.Firestore;

namespace Back.Entities
{
    [FirestoreData]
    public class Reporte
    {

        [FirestoreDocumentId]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [FirestoreProperty("apellidos")]
        public string Apellidos { get; set; } = string.Empty;

        [FirestoreProperty("correo")]
        public string Correo { get; set; } = string.Empty;

        [FirestoreProperty("telefono")]
        public string Telefono { get; set; } = string.Empty;

        [FirestoreProperty("mensaje")]
        public string Mensaje { get; set; } = string.Empty;

        [FirestoreProperty("estado")]
        public string Estado { get; set; } = "Pendiente";

        [FirestoreProperty("respuesta")]
        public string? Respuesta { get; set; }

        [FirestoreProperty("fechaEnvio")]
        public DateTime FechaEnvio { get; set; } = DateTime.UtcNow;
    }
}