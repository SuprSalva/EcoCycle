namespace Back.DTOs;

public class DetalleCompraDTO
{
    public string MateriaPrimaId { get; set; } = string.Empty;
    public string NombreMateriaPrima { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public double PrecioUnitario { get; set; }
}

public class CompraProveedorDTO
{
    public string Id { get; set; } = string.Empty;
    public string ProveedorId { get; set; } = string.Empty;
    public string ProveedorNombre { get; set; } = string.Empty;
    public DateTime FechaCompra { get; set; }
    public double Total { get; set; }
    public string Estado { get; set; } = string.Empty;
    public List<DetalleCompraDTO> Detalles { get; set; } = new List<DetalleCompraDTO>();
}

public class CompraProveedorCrearDTO
{
    public string ProveedorId { get; set; } = string.Empty;
    public string ProveedorNombre { get; set; } = string.Empty;
    public List<DetalleCompraDTO> Detalles { get; set; } = new List<DetalleCompraDTO>();
}
