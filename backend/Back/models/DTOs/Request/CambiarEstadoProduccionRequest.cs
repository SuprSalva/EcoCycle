namespace Back.Models.DTOs.Request
{
    public class CambiarEstadoProduccionRequest
    {
        // Nuevo estado de la producción: "Completada", "En proceso" o "Cancelada".
        public string Estado { get; set; } = string.Empty;
    }
}
