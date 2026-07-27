using Back.Models.DTOs.Request;
using Back.Entities;

public class ProductoCompletoResponse
{
    public string ProductoId { get; set; }

    public string RecetaId { get; set; }

    public string Nombre { get; set; }

    public string Descripcion { get; set; }

    public bool Activo { get; set; }

    public double TiempoEstimadoMinutos { get; set; }

    public List<DetalleRecetaInput> Insumos { get; set; }
}