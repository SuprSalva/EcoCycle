using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;
using Back.Models;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.Entities;
using Back.Services;
using Back.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ComentariosController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IComentariosRepository _comentariosRepository; 
        private readonly IEmailService _emailService;

        public ComentariosController(
            IUsuarioRepository usuarioRepository,
            IComentariosRepository comentariosRepository, 
            IEmailService emailService)
        {
            _usuarioRepository = usuarioRepository;
            _comentariosRepository = comentariosRepository; 
            _emailService = emailService;
        }

        private string GetUserId()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                   ?? throw new InvalidOperationException("No se pudo encontrar el ID de usuario en los claims del token.");
        }

        [HttpPost]
        public async Task<ActionResult<CrearComentarioResponse>> CrearComentario(
            [FromBody] CrearComentarioRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Comentarios comentario = new Comentarios
            {
                Mensaje = request.Mensaje,
                Email = request.Email,
                Estrellas = request.Estrellas,
                Estatus = "Recibido",
                EsPublico = false,
                Fecha = DateTime.UtcNow
            };

            string id = await _comentariosRepository.CrearComentarioAsync(comentario);

            return Ok(new CrearComentarioResponse
            {
                Exito = true,
                Mensaje = "Comentario enviado correctamente.",
                IdComentario = id
            });
        }

        [HttpGet]
        public async Task<ActionResult<List<ComentarioResponse>>> ObtenerComentarios()
        {
            var comentarios = await _comentariosRepository.ObtenerComentariosAsync();

            var response = comentarios.Select(c => new ComentarioResponse
            {
                Id = c.Id,
                Mensaje = c.Mensaje,
                Email = c.Email,
                Estrellas = c.Estrellas,
                Estatus = c.Estatus,
                EsPublico = c.EsPublico,
                Fecha = c.Fecha
            }).ToList();

            return Ok(response);
        }

        [AllowAnonymous]
        [HttpGet("publicos")]
        public async Task<ActionResult<List<ComentarioResponse>>> ObtenerComentariosPublicos()
        {
            var comentarios = await _comentariosRepository.ObtenerComentariosPublicosAsync();

            var response = comentarios.Select(c => new ComentarioResponse
            {
                Id = c.Id,
                Mensaje = c.Mensaje,
                Email = c.Email,
                Estrellas = c.Estrellas,
                Estatus = c.Estatus,
                EsPublico = c.EsPublico,
                Fecha = c.Fecha
            }).ToList();

            return Ok(response);
        }

        // GET: api/comentarios/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ComentarioResponse>> ObtenerComentarioPorId(string id)
        {
            var comentario = await _comentariosRepository.ObtenerComentarioPorIdAsync(id);

            if (comentario == null)
                return NotFound();

            return Ok(new ComentarioResponse
            {
                Id = comentario.Id,
                Mensaje = comentario.Mensaje,
                Email = comentario.Email,
                Estrellas = comentario.Estrellas,
                Estatus = comentario.Estatus,
                EsPublico = comentario.EsPublico,
                Fecha = comentario.Fecha
            });
        }

        [HttpPut("{id}/responder")]
        public async Task<IActionResult> ResponderComentario(string id, [FromBody] ResponderComentarioRequest request)
        {
            try
            {
                Console.WriteLine($"[Comentarios] Intentando responder al comentario ID: {id}");

                var adminId = GetUserId();
                var admin = await _usuarioRepository.ObtenerPorIdAsync(adminId);
                if (admin?.Rol?.ToLower() != "admin")
                    return Forbid("Acceso denegado. Solo administradores pueden responder comentarios.");

                var comentario = await _comentariosRepository.ObtenerComentarioPorIdAsync(id);
                if (comentario == null)
                    return NotFound(ApiResponse<object>.Fail("El comentario no existe."));

                comentario.RespuestaAdmin = request.RespuestaAdmin;
                comentario.Estatus = "Resuelto";

                await _comentariosRepository.ActualizarComentarioAsync(comentario);
                Console.WriteLine($"Comentario {id} actualizado en Firestore con la resolución.");

                Console.WriteLine($"Enviando correo de notificación a: {comentario.Email}");
                bool correoEnviado = await _emailService.EnviarRespuestaComentarioAsync(
                    comentario.Email,
                    request.NombreCliente,
                    comentario.Mensaje, // Usamos la propiedad del objeto recuperado
                    request.RespuestaAdmin
                );

                if (correoEnviado)
                {
                    Console.WriteLine($"Correo enviado exitosamente a {comentario.Email}");
                }
                else
                {
                    Console.WriteLine($"Firestore se actualizó, pero falló el envío del correo a {comentario.Email}");
                }

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Respuesta registrada y notificación enviada por correo.",
                    Datos = new
                    {
                        comentario.Id,
                        comentario.Estatus,
                        CorreoEnviado = correoEnviado
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al responder comentario: {ex.Message}");
                return StatusCode(500, new { Exito = false, Mensaje = $"Error al registrar la respuesta: {ex.Message}" });
            }
        }

        // PUT: api/comentarios/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarComentario(
            string id,
            [FromBody] ActualizarComentarioRequest request)
        {
            var comentario = await _comentariosRepository.ObtenerComentarioPorIdAsync(id);

            if (comentario == null)
                return NotFound();

            comentario.Mensaje = request.Mensaje;
            comentario.Estrellas = request.Estrellas;
            comentario.Estatus = request.Estatus;
            comentario.EsPublico = request.EsPublico;

            await _comentariosRepository.ActualizarComentarioAsync(comentario);

            return Ok(new
            {
                mensaje = "Comentario actualizado correctamente."
            });
        }

        // PATCH: api/comentarios/{id}/visibilidad
        [HttpPatch("{id}/visibilidad")]
        public async Task<IActionResult> CambiarVisibilidad(string id, [FromBody] bool esPublico)
        {
            var comentario = await _comentariosRepository.ObtenerComentarioPorIdAsync(id);

            if (comentario == null)
                return NotFound();

            await _comentariosRepository.CambiarVisibilidadAsync(id, esPublico);

            return Ok(new
            {
                mensaje = $"Visibilidad del comentario modificada a: {(esPublico ? "Público" : "Oculto")}."
            });
        }

        // DELETE: api/comentarios/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarComentario(string id)
        {
            var comentario = await _comentariosRepository.ObtenerComentarioPorIdAsync(id);

            if (comentario == null)
                return NotFound();

            await _comentariosRepository.EliminarComentarioAsync(id);

            return Ok(new
            {
                mensaje = "Comentario eliminado correctamente."
            });
        }
    }
}