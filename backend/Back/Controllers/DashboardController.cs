using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Back.Wrappers;
using System.Threading.Tasks;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(FirestoreDb firestoreDb) : ControllerBase
{
    [HttpGet("resumen")]
    public async Task<IActionResult> GetResumen()
    {
        // 1. Usuarios activos
        var usuariosRef = firestoreDb.Collection("usuarios");
        var usuariosSnap = await usuariosRef.GetSnapshotAsync();
        var totalUsuarios = usuariosSnap.Count;

        // 2. Sesiones de reciclaje
        var sesionesRef = firestoreDb.Collection("sesiones_reciclaje");
        var sesionesSnap = await sesionesRef.GetSnapshotAsync();
        
        long totalBotellas = 0;
        long totalPuntosEmitidos = 0;
        
        // Para la gráfica (Agrupamos por día en los últimos 4 días que haya actividad)
        var agrupadoPorDia = new Dictionary<string, long>();

        foreach (var doc in sesionesSnap.Documents)
        {
            if (doc.TryGetValue("botellas", out long botellas)) totalBotellas += botellas;
            if (doc.TryGetValue("puntos", out long puntos)) totalPuntosEmitidos += puntos;
            
            if (doc.TryGetValue("fecha", out Google.Cloud.Firestore.Timestamp timestamp))
            {
                var dateStr = timestamp.ToDateTime().ToString("dd MMM");
                if (doc.TryGetValue("botellas", out long botellasDelDia))
                {
                    if (agrupadoPorDia.ContainsKey(dateStr)) agrupadoPorDia[dateStr] += botellasDelDia;
                    else agrupadoPorDia[dateStr] = botellasDelDia;
                }
            }
        }
        
        // Tomar los últimos 4 días con actividad
        var graficaDatos = agrupadoPorDia
            .Select(x => new { Dia = x.Key, Cantidad = x.Value })
            .OrderByDescending(x => x.Dia) // Asumiendo formato ordenable o alfabético simple
            .Take(4)
            .Reverse()
            .ToList();
            
        // Si no hay 4, rellenamos con vacíos
        while(graficaDatos.Count < 4) {
            graficaDatos.Insert(0, new { Dia = "--", Cantidad = 0L });
        }
        
        // Calcular el máximo para los porcentajes de altura en HTML
        long maxCantidad = graficaDatos.Max(x => x.Cantidad);
        if (maxCantidad == 0) maxCantidad = 1; // Para evitar división por 0

        // 3. Canjes
        var canjesRef = firestoreDb.Collection("canjes");
        var canjesSnap = await canjesRef.GetSnapshotAsync();
        var totalCanjes = canjesSnap.Count;

        return Ok(ApiResponse<object>.Ok(new {
            totalBotellas,
            totalPuntosEmitidos,
            totalUsuarios,
            totalCanjes,
            grafica = graficaDatos.Select(g => new { 
                dia = g.Dia, 
                cantidad = g.Cantidad, 
                porcentaje = (int)((double)g.Cantidad / maxCantidad * 100) 
            })
        }));
    }
}
