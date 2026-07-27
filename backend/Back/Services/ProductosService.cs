using Back.Entities;
using Back.Models.DTOs.Request;
using Back.Models.DTOs.Response;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;
using System;
using System.Threading.Tasks;

namespace Back.Services
{
    public class ProductosService
    {
        private readonly FirestoreDb _firestore;
        private readonly IMateriaPrimaRepository _materiaPrimaRepository;
        private readonly IProductosRepository _productosRepository;
        private readonly IRecetasRepository _recetasRepository;
        private readonly IRecetasDetalleRepository _recetasDetalleRepository;
        public ProductosService(
                                FirestoreDb firestore,
                                IMateriaPrimaRepository materiaPrimaRepository,
                                IProductosRepository productosRepository,
                                IRecetasRepository recetasRepository,
                                IRecetasDetalleRepository recetasDetalleRepository)
        {
            _firestore = firestore;
            _materiaPrimaRepository = materiaPrimaRepository;
            _productosRepository = productosRepository;
            _recetasRepository = recetasRepository;
            _recetasDetalleRepository = recetasDetalleRepository;
        }

        public async Task<ProductoCompletoResponse?> ObtenerProductoCompletoAsync(string productoId)
        {
            // Buscar producto
            var producto = await _productosRepository.ObtenerProductoPorIdAsync(productoId);

            if (producto == null)
                return null;

            // Buscar receta asociada al producto
            var receta = await _recetasRepository.ObtenerPorProductoIdAsync(productoId);

            if (receta == null)
                return null;

            // Buscar ingredientes de la receta
            var detalles = await _recetasDetalleRepository
                .ObtenerDetallesPorRecetaIdAsync(receta.Id);

            // Construir respuesta
            var response = new ProductoCompletoResponse
            {
                ProductoId = producto.Id,
                RecetaId = receta.Id,

                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Activo = producto.Activo,

                TiempoEstimadoMinutos = receta.TiempoEstimadoMinutos,

                Insumos = detalles.Select(x => new DetalleRecetaInput
                {
                    MateriaPrimaId = x.MateriaPrimaId,
                    NombreMateriaPrima = x.NombreMateriaPrima,
                    Cantidad = x.Cantidad,
                    UnidadMedida = x.UnidadMedida,
                    Observaciones = x.Observaciones
                }).ToList()
            };

            return response;
        }
        public async Task ActualizarProductoConRecetaCompletaAsync(
            string productoId,
            CrearProductoCompletoRequest request)
        {

            // 1. Buscar producto
            var producto =
                await _productosRepository
                .ObtenerProductoPorIdAsync(productoId);


            if (producto == null)
            {
                throw new KeyNotFoundException(
                    "El producto no existe."
                );
            }



            // 2. Actualizar producto

            producto.Nombre = request.Nombre;

            producto.Descripcion = request.Descripcion;


            await _productosRepository
                .ActualizarProductoAsync(producto);



            // 3. Buscar receta relacionada

            var receta =
                await _recetasRepository
                .ObtenerPorProductoIdAsync(productoId);



            if (receta == null)
            {
                throw new KeyNotFoundException(
                    "La receta del producto no existe."
                );
            }



            // 4. Actualizar receta

            receta.NombreProducto = request.Nombre;

            receta.Descripcion = request.Descripcion;

            receta.TiempoEstimadoMinutos =
                request.TiempoEstimadoMinutos;


            await _recetasRepository
                .ActualizarRecetaAsync(receta);



            // 5. Eliminar detalles anteriores

            var detallesActuales =
                await _recetasDetalleRepository
                .ObtenerDetallesPorRecetaIdAsync(receta.Id);



            foreach (var detalle in detallesActuales)
            {

                await _recetasDetalleRepository
                    .EliminarDetalleAsync(detalle.Id);

            }



            // 6. Crear nuevos ingredientes

            foreach (var insumo in request.Insumos)
            {

                var nuevoDetalle = new RecetasDetalle
                {

                    Id = Guid.NewGuid().ToString(),

                    RecetaId = receta.Id,

                    MateriaPrimaId =
                        insumo.MateriaPrimaId,

                    NombreMateriaPrima =
                        insumo.NombreMateriaPrima,

                    Cantidad =
                        insumo.Cantidad,

                    UnidadMedida =
                        insumo.UnidadMedida,

                    Observaciones =
                        insumo.Observaciones

                };


                await _recetasDetalleRepository
                    .CrearDetalleAsync(nuevoDetalle);

            }

        }

        public async Task<string> CrearProductoConRecetaCompletaAsync(CrearProductoCompletoRequest request)
        {
            // 1. Validar que vengan insumos
            if (request.Insumos == null || request.Insumos.Count == 0)
            {
                throw new ArgumentException("El producto debe tener al menos un ingrediente/materia prima en su receta.");
            }

            // 2. Validar que las materias primas existan en el sistema
            foreach (var insumo in request.Insumos)
            {
                var mp = await _materiaPrimaRepository.ObtenerPorIdAsync(insumo.MateriaPrimaId);
                if (mp == null)
                {
                    throw new KeyNotFoundException($"La materia prima con ID '{insumo.MateriaPrimaId}' no existe o no está activa.");
                }
            }

            // 3. Iniciar Batch Atómico de Firestore (Usa StartBatch)
            WriteBatch batch = _firestore.StartBatch();

            // A) Generar ID y Referencia para PRODUCTO
            DocumentReference productoRef = _firestore.Collection("productos").Document();
            var nuevoProducto = new Productos
            {
                Id = productoRef.Id,
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                Activo = true
            };
            batch.Set(productoRef, nuevoProducto);

            // B) Generar ID y Referencia para RECETA
            DocumentReference recetaRef = _firestore.Collection("recetas").Document();
            var nuevaReceta = new Recetas
            {
                Id = recetaRef.Id,
                ProductoId = productoRef.Id,
                NombreProducto = request.Nombre,
                Descripcion = request.Descripcion,
                Version = 1,
                TiempoEstimadoMinutos = request.TiempoEstimadoMinutos,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };
            batch.Set(recetaRef, nuevaReceta);

            // C) Generar IDs y Referencias para cada DETALLE DE RECETA
            foreach (var insumo in request.Insumos)
            {
                DocumentReference detalleRef = _firestore.Collection("recetas_detalle").Document();
                var nuevoDetalle = new RecetasDetalle
                {
                    Id = detalleRef.Id,
                    RecetaId = recetaRef.Id,
                    MateriaPrimaId = insumo.MateriaPrimaId,
                    NombreMateriaPrima = insumo.NombreMateriaPrima,
                    Cantidad = insumo.Cantidad,
                    UnidadMedida = insumo.UnidadMedida,
                    Observaciones = insumo.Observaciones
                };
                batch.Set(detalleRef, nuevoDetalle);
            }

            // 4. Ejecutar la transacción en Firestore
            await batch.CommitAsync();

            return productoRef.Id;
        }
    }
}