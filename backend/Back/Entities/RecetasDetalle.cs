using Google.Cloud.Firestore;

namespace Back.Entities
{
    [FirestoreData]
    public class RecetasDetalle
    {
        [FirestoreDocumentId]
        public string? Id { get; set; }

        [FirestoreProperty]
        public string RecetaId { get; set; } = null!;

        [FirestoreProperty]
        public string MateriaPrimaId { get; set; } = null!;

        [FirestoreProperty]
        public string NombreMateriaPrima { get; set; } = null!;

        [FirestoreProperty]
        public double Cantidad { get; set; } // <-- Cambiado de decimal a double

        [FirestoreProperty]
        public string UnidadMedida { get; set; } = null!;

        [FirestoreProperty]
        public string? Observaciones { get; set; }
    }
}