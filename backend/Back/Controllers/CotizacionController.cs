using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.Entities;
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
    public class CotizacionController : ControllerBase
    {
        private readonly ICotizacionRepository _cotizacionRepository;

        public CotizacionController(ICotizacionRepository cotizacionRepository)
        {
            _cotizacionRepository = cotizacionRepository;
        }

        /// <summary>
        /// Permite a cualquier usuario enviar una solicitud de cotización desde el landing/modal.
        /// </summary>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> CrearCotizacion([FromBody] CrearCotizacionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                Cotizacion cotizacion = new Cotizacion
                {
                    TipoProyecto = request.TipoProyecto,
                    CantidadMaquinas = request.CantidadMaquinas,
                    Ciudad = request.Ciudad,
                    Estado = request.Estado,
                    Materiales = request.Materiales ?? new List<string>(),
                    Objetivo = request.Objetivo,
                    Descripcion = request.Descripcion,
                    PersonasImpactadas = request.PersonasImpactadas,
                    FechaImplementacion = request.FechaImplementacion,
                    Nombre = request.Nombre,
                    Empresa = request.Empresa,
                    Cargo = request.Cargo,
                    Correo = request.Correo,
                    Telefono = request.Telefono,
                    MedioContacto = request.MedioContacto,
                    AceptaAviso = request.AceptaAviso,
                    Estatus = "Pendiente",
                    FechaCreacion = DateTime.UtcNow
                };

                string id = await _cotizacionRepository.CrearCotizacionAsync(cotizacion);

                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Cotización enviada correctamente.",
                    IdCotizacion = id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al registrar cotización: {ex.Message}");
                return StatusCode(500, new { Exito = false, Mensaje = $"Error al procesar la solicitud: {ex.Message}" });
            }
        }

        /// <summary>
        /// Obtiene todas las solicitudes de cotización recibidas (Requiere Autenticación).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<CotizacionResponse>>> ObtenerCotizaciones()
        {
            var cotizaciones = await _cotizacionRepository.ObtenerCotizacionesAsync();

            var response = cotizaciones.Select(c => new CotizacionResponse
            {
                Id = c.Id,
                TipoProyecto = c.TipoProyecto,
                CantidadMaquinas = c.CantidadMaquinas,
                Ciudad = c.Ciudad,
                Estado = c.Estado,
                Materiales = c.Materiales,
                Objetivo = c.Objetivo,
                Descripcion = c.Descripcion,
                PersonasImpactadas = c.PersonasImpactadas,
                FechaImplementacion = c.FechaImplementacion,
                Nombre = c.Nombre,
                Empresa = c.Empresa,
                Cargo = c.Cargo,
                Correo = c.Correo,
                Telefono = c.Telefono,
                MedioContacto = c.MedioContacto,
                AceptaAviso = c.AceptaAviso,
                Estatus = c.Estatus,
                FechaCreacion = c.FechaCreacion
            }).ToList();

            return Ok(response);
        }

        /// <summary>
        /// Obtiene el detalle de una cotización específica por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CotizacionResponse>> ObtenerCotizacionPorId(string id)
        {
            var cotizacion = await _cotizacionRepository.ObtenerCotizacionPorIdAsync(id);

            if (cotizacion == null)
                return NotFound(new { Exito = false, Mensaje = "La cotización no fue encontrada." });

            return Ok(new CotizacionResponse
            {
                Id = cotizacion.Id,
                TipoProyecto = cotizacion.TipoProyecto,
                CantidadMaquinas = cotizacion.CantidadMaquinas,
                Ciudad = cotizacion.Ciudad,
                Estado = cotizacion.Estado,
                Materiales = cotizacion.Materiales,
                Objetivo = cotizacion.Objetivo,
                Descripcion = cotizacion.Descripcion,
                PersonasImpactadas = cotizacion.PersonasImpactadas,
                FechaImplementacion = cotizacion.FechaImplementacion,
                Nombre = cotizacion.Nombre,
                Empresa = cotizacion.Empresa,
                Cargo = cotizacion.Cargo,
                Correo = cotizacion.Correo,
                Telefono = cotizacion.Telefono,
                MedioContacto = cotizacion.MedioContacto,
                AceptaAviso = cotizacion.AceptaAviso,
                Estatus = cotizacion.Estatus,
                FechaCreacion = cotizacion.FechaCreacion
            });
        }

        /// <summary>
        /// Permite actualizar únicamente el estatus de la cotización (ej. "Atendido", "En Proceso", "Rechazado").
        /// </summary>
        [HttpPatch("{id}/estatus")]
        public async Task<IActionResult> ActualizarEstatus(string id, [FromBody] ActualizarEstatusCotizacionRequest request)
        {
            var cotizacion = await _cotizacionRepository.ObtenerCotizacionPorIdAsync(id);

            if (cotizacion == null)
                return NotFound(new { Exito = false, Mensaje = "Cotización no encontrada." });

            await _cotizacionRepository.ActualizarEstatusAsync(id, request.Estatus);

            return Ok(new
            {
                Exito = true,
                Mensaje = $"Estatus actualizado a '{request.Estatus}' correctamente."
            });
        }

        /// <summary>
        /// Elimina un registro de cotización por ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCotizacion(string id)
        {
            var cotizacion = await _cotizacionRepository.ObtenerCotizacionPorIdAsync(id);

            if (cotizacion == null)
                return NotFound(new { Exito = false, Mensaje = "Cotización no encontrada." });

            await _cotizacionRepository.EliminarCotizacionAsync(id);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Cotización eliminada correctamente."
            });
        }
    }
}