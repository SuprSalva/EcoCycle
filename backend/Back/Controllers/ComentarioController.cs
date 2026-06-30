using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Back.Wrappers;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protegido para que solo personal autenticado acceda
public class ComentarioController : ControllerBase
{
    private readonly FirestoreDb _firestoreDb;

    public ComentarioController(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    /// <summary>
    /// GET: api/Comentario/todos
    /// Trae el listado completo de valoraciones y comentarios de los clientes para auditoría del Admin.
    /// </summary>
    [HttpGet("todos")]
    public async Task<IActionResult> ObtenerTodos()
    {
        try
        {
            CollectionReference colRef = _firestoreDb.Collection("comentarios");
            // Ordenamos por fecha de forma descendente para mostrar lo más reciente primero
            Query query = colRef.OrderByDescending("fecha");
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            var listaComentarios = new List<object>();
            foreach (DocumentSnapshot doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    var data = doc.ToDictionary();
                    data["id"] = doc.Id;
                    listaComentarios.Add(data);
                }
            }
            
            return Ok(ApiResponse<List<object>>.Ok(listaComentarios, "Lista global de comentarios obtenida correctamente para administración."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<object>>.Fail($"Error al recuperar el historial global: {ex.Message}"));
        }
    }
}