using System;
using System.Collections.Generic;

namespace Back.Models.DTOs.Response
{
    public class CotizacionResponse
    {
        public string Id { get; set; }
        public string TipoProyecto { get; set; }
        public int CantidadMaquinas { get; set; }
        public string Ciudad { get; set; }
        public string Estado { get; set; }
        public List<string> Materiales { get; set; }
        public string Objetivo { get; set; }
        public string Descripcion { get; set; }
        public int? PersonasImpactadas { get; set; }
        public string FechaImplementacion { get; set; }
        public string Nombre { get; set; }
        public string Empresa { get; set; }
        public string Cargo { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public string MedioContacto { get; set; }
        public bool AceptaAviso { get; set; }
        public string Estatus { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}