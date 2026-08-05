using Back.Entities;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.Repositories.Interfaces;
using Back.Services;
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
    public class ProductosController : ControllerBase
    {
        private readonly IProductosRepository _productosRepository;
        private readonly ProductosService _productosService;

        public ProductosController(
            IProductosRepository productosRepository,
            ProductosService productosService)
        {
            _productosRepository = productosRepository;
            _productosService = productosService;
        }

        // POST: api/productos
        [HttpPost]
        public async Task<ActionResult> CrearProducto([FromForm] CrearProductoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var producto = new Productos
            {
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                Activo = request.Activo
            };

            string id = await _productosRepository.CrearProductoAsync(producto);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Producto creado correctamente.",
                IdProducto = id
            });
        }

        // GET: api/productos
        [HttpGet]
        public async Task<ActionResult<List<ProductoResponse>>> ObtenerProductos()
        {
            var productos = await _productosRepository.ObtenerProductosAsync();

            var response = productos.Select(p => new ProductoResponse
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Activo = p.Activo,
            }).ToList();

            return Ok(response);
        }

        // GET: api/productos/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoResponse>> ObtenerProductoPorId(string id)
        {
            var producto = await _productosRepository.ObtenerProductoPorIdAsync(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    Exito = false,
                    Mensaje = "El producto no existe."
                });
            }

            return Ok(new ProductoResponse
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Activo = producto.Activo,
            });
        }

        [HttpPost("completo")]
        public async Task<IActionResult> CrearProductoCompleto([FromBody] CrearProductoCompletoRequest request)
        {
            try
            {
                var productoId = await _productosService.CrearProductoConRecetaCompletaAsync(request);
                return Ok(new
                {
                    mensaje = "Producto, receta y detalles de receta creados exitosamente en un solo flujo.",
                    productoId = productoId
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Ocurrió un error al procesar el registro en Firestore.", detalle = ex.Message });
            }
        }

        // PUT: api/productos/completo/{id}
        [HttpPut("completo/{id}")]
        public async Task<IActionResult> ActualizarProductoCompleto(
            string id,
            [FromBody] CrearProductoCompletoRequest request)
        {
            try
            {

                await _productosService
                    .ActualizarProductoConRecetaCompletaAsync(id, request);


                return Ok(new
                {
                    Exito = true,
                    Mensaje = "Producto, receta e ingredientes actualizados correctamente."
                });

            }
            catch (KeyNotFoundException ex)
            {

                return NotFound(new
                {
                    Exito = false,
                    Mensaje = ex.Message
                });

            }
            catch (Exception ex)
            {

                return BadRequest(new
                {
                    Exito = false,
                    Mensaje = "Error al actualizar el producto completo.",
                    Error = ex.Message
                });

            }
        }
        // GET: api/productos/completo/{id}
        [HttpGet("completo/{id}")]
        public async Task<IActionResult> ObtenerProductoCompleto(string id)
        {
            var producto = await _productosService
                .ObtenerProductoCompletoAsync(id);


            if (producto == null)
            {
                return NotFound(new
                {
                    Exito = false,
                    Mensaje = "No se encontró el producto completo."
                });
            }


            return Ok(producto);
        }

        // PUT: api/productos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarProducto(
            string id,
            [FromBody] ActualizarProductoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var productoExistente = await _productosRepository.ObtenerProductoPorIdAsync(id);

            if (productoExistente == null)
            {
                return NotFound(new
                {
                    Exito = false,
                    Mensaje = "El producto a actualizar no existe."
                });
            }

            productoExistente.Nombre = request.Nombre;
            productoExistente.Descripcion = request.Descripcion;
            productoExistente.Activo = request.Activo;

            await _productosRepository.ActualizarProductoAsync(productoExistente);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Producto actualizado correctamente."
            });
        }

        // PATCH: api/productos/{id}/estatus
        [HttpPatch("{id}/estatus")]
        public async Task<IActionResult> ActualizarEstatusActivo(
            string id,
            [FromBody] ActualizarEstatusProductoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != request.Id)
            {
                return BadRequest(new
                {
                    Exito = false,
                    Mensaje = "El ID de la URL no coincide con el ID del cuerpo."
                });
            }

            var productoExistente = await _productosRepository.ObtenerProductoPorIdAsync(id);

            if (productoExistente == null)
            {
                return NotFound(new
                {
                    Exito = false,
                    Mensaje = "El producto no existe."
                });
            }

            await _productosRepository.ActualizarEstatusActivoAsync(id, request.Activo);

            return Ok(new
            {
                Exito = true,
                Mensaje = $"Estatus del producto actualizado a: {(request.Activo ? "Activo" : "Inactivo")}."
            });
        }

        // DELETE: api/productos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarProducto(string id)
        {
            var producto = await _productosRepository.ObtenerProductoPorIdAsync(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    Exito = false,
                    Mensaje = "El producto a eliminar no existe."
                });
            }

            await _productosRepository.EliminarProductoAsync(id);

            return Ok(new
            {
                Exito = true,
                Mensaje = "Producto eliminado correctamente."
            });
        }
    }
}