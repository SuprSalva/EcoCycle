using Back.Entities;
using Back.DTOs;
using Back.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecetasDetalleController : ControllerBase
    {
        private readonly IRecetasDetalleRepository _repository;

        public RecetasDetalleController(IRecetasDetalleRepository repository)
        {
            _repository = repository;
        }

        // POST: api/recetasdetalle
        [HttpPost]
        public async Task<ActionResult> CrearDetalle([FromBody] CrearRecetaDetalleRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            RecetasDetalle detalle = new RecetasDetalle
            {
                RecetaId = request.RecetaId,
                MateriaPrimaId = request.MateriaPrimaId,
                NombreMateriaPrima = request.NombreMateriaPrima,
                Cantidad = request.Cantidad,
                UnidadMedida = request.UnidadMedida,
                Observaciones = request.Observaciones
            };

            string id = await _repository.CrearDetalleAsync(detalle);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Insumo agregado a la receta correctamente.",
                IdDetalle = id
            });
        }

        // GET: api/recetasdetalle/receta/{recetaId}
        [HttpGet("receta/{recetaId}")]
        public async Task<ActionResult<List<RecetaDetalleResponse>>> ObtenerDetallesPorReceta(string recetaId)
        {
            var detalles = await _repository.ObtenerDetallesPorRecetaIdAsync(recetaId);

            var response = detalles.Select(d => new RecetaDetalleResponse
            {
                Id = d.Id!,
                RecetaId = d.RecetaId,
                MateriaPrimaId = d.MateriaPrimaId,
                NombreMateriaPrima = d.NombreMateriaPrima,
                Cantidad = d.Cantidad,
                UnidadMedida = d.UnidadMedida,
                Observaciones = d.Observaciones
            }).ToList();

            return Ok(response);
        }

        // PUT: api/recetasdetalle/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarDetalle(string id, [FromBody] ActualizarRecetaDetalleRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existente = await _repository.ObtenerDetallePorIdAsync(id);

            if (existente == null)
                return NotFound(new { Exito = false, Mensaje = "El detalle especificado no existe." });

            existente.RecetaId = request.RecetaId;
            existente.MateriaPrimaId = request.MateriaPrimaId;
            existente.NombreMateriaPrima = request.NombreMateriaPrima;
            existente.Cantidad = request.Cantidad;
            existente.UnidadMedida = request.UnidadMedida;
            existente.Observaciones = request.Observaciones;

            await _repository.ActualizarDetalleAsync(existente);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Insumo de la receta actualizado correctamente."
            });
        }

        // DELETE: api/recetasdetalle/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarDetalle(string id)
        {
            var existente = await _repository.ObtenerDetallePorIdAsync(id);

            if (existente == null)
                return NotFound(new { Exito = false, Mensaje = "El detalle a eliminar no existe." });

            await _repository.EliminarDetalleAsync(id);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Insumo eliminado de la receta correctamente."
            });
        }
    }
}