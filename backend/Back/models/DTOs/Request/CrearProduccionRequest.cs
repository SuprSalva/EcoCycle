namespace Back.Models.DTOs.Request
{
    public class CrearProduccionRequest
    {
        // Producto a fabricar (debe tener una receta activa).
        public string ProductoId { get; set; } = string.Empty;

        // Unidades a producir. Multiplica las cantidades de la receta.
        public double Cantidad { get; set; }

        public string? Observaciones { get; set; }
    }
}
