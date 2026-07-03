using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Back.Wrappers;
using Back.Repositories.Interfaces;  // ✅ Para IUsuarioRepository
using Google.Cloud.Firestore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Back.Models.DTOs.Request;

namespace Back.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComentarioController : ControllerBase
{
    private readonly FirestoreDb _firestoreDb;
    private readonly IUsuarioRepository _usuarioRepository;  // ✅ Agregar

    // ✅ INYECTAR IUsuarioRepository
    public ComentarioController(FirestoreDb firestoreDb, IUsuarioRepository usuarioRepository)
    {
        _firestoreDb = firestoreDb;
        _usuarioRepository = usuarioRepository;
    }

    /// <summary>
    /// POST: api/Comentario/crear
    /// </summary>
    [HttpPost("crear")]
    public async Task<IActionResult> CrearComentario([FromBody] ComentarioRequest request)
    {
        try
        {
            var email = User.FindFirst("email")?.Value ?? User.FindFirst(ClaimTypes.Email)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no autenticado correctamente."));
            }

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
    /// SOLO ADMINISTRADORES
    /// </summary>
    [HttpGet("todos")]
    public async Task<IActionResult> ObtenerTodos()
    {
        try
        {
            // ✅ OBTENER USERID DEL TOKEN
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                         User.FindFirst("user_id")?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no autenticado."));
            }

            // ✅ BUSCAR USUARIO EN FIRESTORE PARA OBTENER SU ROL
            var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
            
            if (usuario == null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no encontrado."));
            }

            // ✅ VERIFICAR SI ES ADMIN
            if (string.IsNullOrEmpty(usuario.Rol) || 
                !usuario.Rol.Equals("admin", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid("Acceso denegado. Solo administradores pueden ver todos los comentarios.");
            }

            // ✅ OBTENER TODOS LOS COMENTARIOS
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
            
            Console.WriteLine($"✅ Admin {usuario.Email} obtuvo {listaComentarios.Count} comentarios");
            
            return Ok(ApiResponse<List<object>>.Ok(listaComentarios, "Lista global de comentarios obtenida correctamente."));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en ObtenerTodos: {ex.Message}");
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

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(ApiResponse<object>.Fail("Usuario no autenticado."));
            }

            CollectionReference colRef = _firestoreDb.Collection("comentarios");
            
            // Filtrar por email
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
            
            Console.WriteLine($"✅ Usuario {email} tiene {misComentarios.Count} comentarios");
            
            return Ok(ApiResponse<List<object>>.Ok(misComentarios, "Tus comentarios obtenidos correctamente."));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error en ObtenerMisComentarios: {ex.Message}");
            return StatusCode(500, ApiResponse<List<object>>.Fail($"Error al recuperar tus comentarios: {ex.Message}"));
        }
    }
    // 📁 Back/Controllers/ComentarioController.cs - Agregar estos métodos

[HttpPut("{id}")]
public async Task<IActionResult> ActualizarComentario(string id, [FromBody] Dictionary<string, object> updates)
{
    try
    {
        // Verificar si es admin
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario?.Rol?.ToLower() != "admin")
        {
            return Forbid("Acceso denegado.");
        }

        DocumentReference docRef = _firestoreDb.Collection("comentarios").Document(id);
        await docRef.UpdateAsync(updates);
        
        return Ok(ApiResponse<object>.Ok(null, "Comentario actualizado correctamente."));
    }
    catch (Exception ex)
    {
        return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
    }
}

[HttpDelete("{id}")]
public async Task<IActionResult> EliminarComentario(string id)
{
    try
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("user_id")?.Value;
        var usuario = await _usuarioRepository.ObtenerPorIdAsync(userId);
        if (usuario?.Rol?.ToLower() != "admin")
        {
            return Forbid("Acceso denegado.");
        }

        DocumentReference docRef = _firestoreDb.Collection("comentarios").Document(id);
        await docRef.DeleteAsync();
        
        return Ok(ApiResponse<object>.Ok(null, "Comentario eliminado correctamente."));
    }
    catch (Exception ex)
    {
        return StatusCode(500, ApiResponse<object>.Fail($"Error: {ex.Message}"));
    }
}
}