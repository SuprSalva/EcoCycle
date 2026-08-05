using System.Collections.Generic;

namespace Back.Models.DTOs.Request
{
    public class ActualizarProductoCompletoRequest
    {
        public string Nombre { get; set; }

        public string Descripcion { get; set; }

        public int TiempoEstimadoMinutos { get; set; }

        public List<DetalleRecetaInput> Insumos { get; set; }
    }
}