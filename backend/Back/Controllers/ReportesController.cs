using System.Security.Claims;
using Back.DTOs.Request;
using Back.DTOs.Response;
using Back.Entities;
using Back.Repositories.Interfaces;
using Back.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportesController : ControllerBase
    {
        private readonly IReporteRepository _reporteRepository;

        public ReportesController(IReporteRepository reporteRepository)
        {
            _reporteRepository = reporteRepository;
        }

        // GET: api/reportes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReporteResponse>>> ObtenerTodos()
        {
            var reportes = await _reporteRepository.ObtenerTodosAsync();

            var response = reportes.Select(r => new ReporteResponse
            {
                Id = r.Id,
                Nombre = r.Nombre,
                Apellidos = r.Apellidos,
                Correo = r.Correo,
                Telefono = r.Telefono,
                Mensaje = r.Mensaje,
                Estado = r.Estado,
                Respuesta = r.Respuesta,
                FechaEnvio = r.FechaEnvio
            });

            return Ok(response);
        }

        // GET: api/reportes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReporteResponse>> ObtenerPorId(string id)
        {
            var reporte = await _reporteRepository.ObtenerPorIdAsync(id);

            if (reporte == null)
                return NotFound();

            var response = new ReporteResponse
            {
                Id = reporte.Id,
                Nombre = reporte.Nombre,
                Apellidos = reporte.Apellidos,
                Correo = reporte.Correo,
                Telefono = reporte.Telefono,
                Mensaje = reporte.Mensaje,
                Estado = reporte.Estado,
                Respuesta = reporte.Respuesta,
                FechaEnvio = reporte.FechaEnvio
            };

            return Ok(response);
        }

        // POST: api/reportes
        [HttpPost]
        public async Task<ActionResult> Crear(CrearReporteRequest request)
        {
            var reporte = new Reporte
            {
                Nombre = request.Nombre,
                Apellidos = request.Apellidos,
                Correo = request.Correo,
                Telefono = request.Telefono,
                Mensaje = request.Mensaje,
                Estado = "Pendiente",
                Respuesta = null,
                FechaEnvio = DateTime.UtcNow
            };

            await _reporteRepository.CrearAsync(reporte);

            return Ok(new
            {
                mensaje = "Reporte enviado correctamente."
            });
        }

        // PUT: api/reportes/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Actualizar(string id, ActualizarReporteRequest request)
        {
            var reporte = await _reporteRepository.ObtenerPorIdAsync(id);

            if (reporte == null)
                return NotFound();

            reporte.Estado = request.Estado;
            reporte.Respuesta = request.Respuesta;

            await _reporteRepository.ActualizarAsync(id, reporte);

            return Ok(new
            {
                mensaje = "Reporte actualizado correctamente."
            });
        }

        // DELETE: api/reportes/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Eliminar(string id)
        {
            var reporte = await _reporteRepository.ObtenerPorIdAsync(id);

            if (reporte == null)
                return NotFound();

            await _reporteRepository.EliminarAsync(id);

            return Ok(new
            {
                mensaje = "Reporte eliminado correctamente."
            });
        }
    }
}