using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Back.Models.DTOs.Request
{
    public class CrearCotizacionRequest
    {
        [Required(ErrorMessage = "El tipo de proyecto es requerido.")]
        public string TipoProyecto { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "La cantidad de máquinas debe ser al menos 1.")]
        public int CantidadMaquinas { get; set; }

        [Required(ErrorMessage = "La ciudad es requerida.")]
        public string Ciudad { get; set; }

        [Required(ErrorMessage = "El estado es requerido.")]
        public string Estado { get; set; }

        public List<string> Materiales { get; set; } = new List<string>();

        [Required(ErrorMessage = "El objetivo principal es requerido.")]
        public string Objetivo { get; set; }

        public string Descripcion { get; set; }

        public int? PersonasImpactadas { get; set; }

        public string FechaImplementacion { get; set; }

        [Required(ErrorMessage = "El nombre de contacto es requerido.")]
        public string Nombre { get; set; }

        public string Empresa { get; set; }

        public string Cargo { get; set; }

        [Required(ErrorMessage = "El correo electrónico es requerido.")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido.")]
        public string Correo { get; set; }

        [Required(ErrorMessage = "El teléfono de contacto es requerido.")]
        public string Telefono { get; set; }

        [Required(ErrorMessage = "El medio de contacto es requerido.")]
        public string MedioContacto { get; set; }

        [Range(typeof(bool), "true", "true", ErrorMessage = "Debe aceptar el aviso de privacidad.")]
        public bool AceptaAviso { get; set; }
    }
}