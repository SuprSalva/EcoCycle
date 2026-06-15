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

        foreach (var doc in sesionesSnap.Documents)
        {
            if (doc.TryGetValue("botellas", out long botellas)) totalBotellas += botellas;
            if (doc.TryGetValue("puntos", out long puntos)) totalPuntosEmitidos += puntos;
        }

        // 3. Canjes
        var canjesRef = firestoreDb.Collection("canjes");
        var canjesSnap = await canjesRef.GetSnapshotAsync();
        var totalCanjes = canjesSnap.Count;

        return Ok(ApiResponse<object>.Ok(new {
            totalBotellas,
            totalPuntosEmitidos,
            totalUsuarios,
            totalCanjes
        }));
    }
}
