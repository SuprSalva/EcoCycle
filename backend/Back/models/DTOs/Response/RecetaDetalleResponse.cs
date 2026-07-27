namespace Back.DTOs
{
    public class RecetaDetalleResponse
    {
        public string Id { get; set; } = null!;
        public string RecetaId { get; set; } = null!;
        public string MateriaPrimaId { get; set; } = null!;
        public string NombreMateriaPrima { get; set; } = null!;
        public double Cantidad { get; set; }
        public string UnidadMedida { get; set; } = null!;
        public string? Observaciones { get; set; }
    }
}