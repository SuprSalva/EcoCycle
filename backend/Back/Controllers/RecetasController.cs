using Back.Entities;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecetasController : ControllerBase
    {
        private readonly IRecetasRepository _recetasRepository;

        public RecetasController(IRecetasRepository recetasRepository)
        {
            _recetasRepository = recetasRepository;
        }

        // POST: api/recetas
        [HttpPost]
        public async Task<ActionResult> CrearReceta([FromBody] CrearRecetaRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            Recetas receta = new Recetas
            {
                ProductoId = request.ProductoId,
                NombreProducto = request.NombreProducto,
                Descripcion = request.Descripcion,
                Version = request.Version,
                TiempoEstimadoMinutos = request.TiempoEstimadoMinutos,
                Activo = request.Activo,
                FechaCreacion = DateTime.UtcNow
            };

            string id = await _recetasRepository.CrearRecetaAsync(receta);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Receta creada correctamente.",
                IdReceta = id
            });
        }

        // GET: api/recetas
        [HttpGet]
        public async Task<ActionResult<List<RecetaResponse>>> ObtenerRecetas()
        {
            var recetas = await _recetasRepository.ObtenerRecetasAsync();

            var response = recetas.Select(r => new RecetaResponse
            {
                Id = r.Id,
                ProductoId = r.ProductoId,
                NombreProducto = r.NombreProducto,
                Descripcion = r.Descripcion,
                Version = r.Version,
                TiempoEstimadoMinutos = r.TiempoEstimadoMinutos,
                Activo = r.Activo,
                FechaCreacion = r.FechaCreacion
            }).ToList();

            return Ok(response);
        }

        // GET: api/recetas/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RecetaResponse>> ObtenerRecetaPorId(string id)
        {
            var receta = await _recetasRepository.ObtenerRecetaPorIdAsync(id);

            if (receta == null)
                return NotFound(new { Exito = false, Mensaje = "La receta no existe." });

            return Ok(new RecetaResponse
            {
                Id = receta.Id,
                ProductoId = receta.ProductoId,
                NombreProducto = receta.NombreProducto,
                Descripcion = receta.Descripcion,
                Version = receta.Version,
                TiempoEstimadoMinutos = receta.TiempoEstimadoMinutos,
                Activo = receta.Activo,
                FechaCreacion = receta.FechaCreacion
            });
        }

        // PUT: api/recetas/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarReceta(string id, [FromBody] ActualizarRecetaRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recetaExistente = await _recetasRepository.ObtenerRecetaPorIdAsync(id);

            if (recetaExistente == null)
                return NotFound(new { Exito = false, Mensaje = "La receta a actualizar no existe." });

            recetaExistente.ProductoId = request.ProductoId;
            recetaExistente.NombreProducto = request.NombreProducto;
            recetaExistente.Descripcion = request.Descripcion;
            recetaExistente.Version = request.Version;
            recetaExistente.TiempoEstimadoMinutos = request.TiempoEstimadoMinutos;
            recetaExistente.Activo = request.Activo;

            await _recetasRepository.ActualizarRecetaAsync(recetaExistente);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Receta actualizada correctamente."
            });
        }

        // PATCH: api/recetas/{id}/estatus
        [HttpPatch("{id}/estatus")]
        public async Task<IActionResult> ActualizarEstatusRecetaActivo(string id, [FromBody] ActualizarEstatusRecetaRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var recetaExistente = await _recetasRepository.ObtenerRecetaPorIdAsync(id);

            if (recetaExistente == null)
                return NotFound(new { Exito = false, Mensaje = "La receta no existe." });

            await _recetasRepository.ActualizarEstatusActivoAsync(id, request.Activo);

            return Ok(new
            {
                Exito = true,
                Mensaje = $"Estatus de la receta actualizado a: {(request.Activo ? "Activo" : "Inactivo")}."
            });
        }

        // DELETE: api/recetas/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarReceta(string id)
        {
            var receta = await _recetasRepository.ObtenerRecetaPorIdAsync(id);

            if (receta == null)
                return NotFound(new { Exito = false, Mensaje = "La receta a eliminar no existe." });

            await _recetasRepository.EliminarRecetaAsync(id);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Receta eliminada correctamente."
            });
        }
    }
}