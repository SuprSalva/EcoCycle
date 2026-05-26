namespace Back.Models.DTOs.Response;

public class DashboardStatsResponse
{
    public int TotalUsuarios { get; set; }
    public int UsuariosActivos { get; set; }
    public int TotalBotellasRecicladas { get; set; }
    public decimal TotalPuntosEmitidos { get; set; }
    public decimal TotalPuntosCanjeados { get; set; }
    public int TotalCanjes { get; set; }
    public int TotalRecompensasActivas { get; set; }
}