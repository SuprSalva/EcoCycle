using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;

namespace Back.Entities
{
    [FirestoreData]
    public class Cotizacion
    {
        [FirestoreDocumentId]
        public string Id { get; set; }

        [FirestoreProperty]
        public string TipoProyecto { get; set; }

        [FirestoreProperty]
        public int CantidadMaquinas { get; set; }

        [FirestoreProperty]
        public string Ciudad { get; set; }

        [FirestoreProperty]
        public string Estado { get; set; }

        [FirestoreProperty]
        public List<string> Materiales { get; set; } = new List<string>();

        [FirestoreProperty]
        public string Objetivo { get; set; }

        [FirestoreProperty]
        public string Descripcion { get; set; }

        [FirestoreProperty]
        public int? PersonasImpactadas { get; set; }

        [FirestoreProperty]
        public string FechaImplementacion { get; set; }

        [FirestoreProperty]
        public string Nombre { get; set; }

        [FirestoreProperty]
        public string Empresa { get; set; }

        [FirestoreProperty]
        public string Cargo { get; set; }

        [FirestoreProperty]
        public string Correo { get; set; }

        [FirestoreProperty]
        public string Telefono { get; set; }

        [FirestoreProperty]
        public string MedioContacto { get; set; }

        [FirestoreProperty]
        public bool AceptaAviso { get; set; }

        /// <summary>
        /// Auditoría básica: Estatus del proceso (ej. "Pendiente", "Atendido", "En Cotización")
        /// </summary>
        [FirestoreProperty]
        public string Estatus { get; set; } = "Pendiente";

        /// <summary>
        /// Fecha de registro de la solicitud de cotización en el sistema
        /// </summary>
        [FirestoreProperty]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    }
}