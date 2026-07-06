using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Back.DTOs.Request
{
    public class RegistrarCompraRequest
    {
        
    public string? ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public int Cantidad { get; set; } = 1;
    public double PrecioUnitario { get; set; }
    public string? ManualUrl { get; set; }
    }
}