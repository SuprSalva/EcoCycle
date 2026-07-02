using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Back.Wrappers;
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Back.Models.DTOs.Request;
namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Protegido para que solo usuarios autenticados accedan
public class ComentarioController : ControllerBase
{
    private readonly FirestoreDb _firestoreDb;

    public ComentarioController(FirestoreDb firestoreDb)
    {
        _firestoreDb = firestoreDb;
    }

    /// <summary>
    /// POST: api/Comentario/crear
    /// Crea un nuevo comentario (cualquier usuario autenticado puede hacerlo)
    /// </summary>
    [HttpPost("crear")]
    public async Task<IActionResult> CrearComentario([FromBody] ComentarioRequest request)
    {
        try
        {
            // Obtener el email del usuario autenticado
            var email = User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no autenticado correctamente."));
            }

            // Crear el documento en Firestore
            var comentario = new Dictionary<string, object>
            {
                ["asunto"] = request.Asunto,
                ["mensaje"] = request.Mensaje,
                ["categoria"] = request.Categoria ?? "Sugerencia",
                ["email"] = email,
                ["usuarioId"] = userId ?? "desconocido",
                ["estatus"] = "Recibido",
                ["fecha"] = DateTime.Now.ToString("dd 'de' MMMM 'de' yyyy 'a las' hh:mm:ss tt 'UTC-6'")
            };

            DocumentReference docRef = await _firestoreDb.Collection("comentarios").AddAsync(comentario);

            return Ok(ApiResponse<object>.Ok(
                new { id = docRef.Id }, 
                "Comentario enviado correctamente. Gracias por tu retroalimentación."
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Fail($"Error al guardar el comentario: {ex.Message}"));
        }
    }

    /// <summary>
    /// GET: api/Comentario/todos
    /// SOLO ADMINISTRADORES - Trae el listado completo de valoraciones y comentarios
    /// </summary>
    [HttpGet("todos")]
    public async Task<IActionResult> ObtenerTodos()
    {
        try
        {
            // Verificar si el usuario es administrador
            var rol = User.FindFirst("rol")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(rol) || !rol.Equals("admin", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid("Acceso denegado. Solo administradores pueden ver todos los comentarios.");
            }

            CollectionReference colRef = _firestoreDb.Collection("comentarios");
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
            
            return Ok(ApiResponse<List<object>>.Ok(listaComentarios, "Lista global de comentarios obtenida correctamente."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<object>>.Fail($"Error al recuperar el historial: {ex.Message}"));
        }
    }

    /// <summary>
    /// GET: api/Comentario/mis-comentarios
    /// Obtiene solo los comentarios del usuario autenticado
    /// </summary>
    [HttpGet("mis-comentarios")]
    public async Task<IActionResult> ObtenerMisComentarios()
    {
        try
        {
            var email = User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no autenticado."));
            }

            CollectionReference colRef = _firestoreDb.Collection("comentarios");
            
            // Filtrar por email o userId
            Query query = colRef.WhereEqualTo("email", email);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            var misComentarios = new List<object>();
            foreach (DocumentSnapshot doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    var data = doc.ToDictionary();
                    data["id"] = doc.Id;
                    misComentarios.Add(data);
                }
            }
            
            return Ok(ApiResponse<List<object>>.Ok(misComentarios, "Tus comentarios obtenidos correctamente."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<List<object>>.Fail($"Error al recuperar tus comentarios: {ex.Message}"));
        }
    }
}