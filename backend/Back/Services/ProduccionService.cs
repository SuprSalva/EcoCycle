using Back.Entities;
using Back.Models.DTOs.Request;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Services
{
    public class ProduccionService
    {
        private readonly FirestoreDb _firestore;
        private readonly IProductosRepository _productosRepository;
        private readonly IRecetasRepository _recetasRepository;
        private readonly IRecetasDetalleRepository _recetasDetalleRepository;
        private readonly IMateriaPrimaRepository _materiaPrimaRepository;

        public ProduccionService(
            FirestoreDb firestore,
            IProductosRepository productosRepository,
            IRecetasRepository recetasRepository,
            IRecetasDetalleRepository recetasDetalleRepository,
            IMateriaPrimaRepository materiaPrimaRepository)
        {
            _firestore = firestore;
            _productosRepository = productosRepository;
            _recetasRepository = recetasRepository;
            _recetasDetalleRepository = recetasDetalleRepository;
            _materiaPrimaRepository = materiaPrimaRepository;
        }

        // Registra una corrida de producción: valida stock, descuenta materia prima
        // (una transacción de "Salida" por insumo) y guarda el registro de producción,
        // todo dentro de un batch atómico de Firestore.
        public async Task<Produccion> CrearProduccionAsync(CrearProduccionRequest request, string usuarioId)
        {
            if (request.Cantidad <= 0)
                throw new ArgumentException("La cantidad a producir debe ser mayor a cero.");

            // 1. Producto
            var producto = await _productosRepository.ObtenerProductoPorIdAsync(request.ProductoId);
            if (producto == null)
                throw new KeyNotFoundException("El producto no existe.");
            if (!producto.Activo)
                throw new ArgumentException("El producto está inactivo; no se puede producir.");

            // 2. Receta asociada
            var receta = await _recetasRepository.ObtenerPorProductoIdAsync(request.ProductoId);
            if (receta == null)
                throw new KeyNotFoundException("El producto no tiene una receta asociada.");
            if (!receta.Activo)
                throw new ArgumentException("La receta del producto está inactiva; no se puede producir.");

            // 3. Insumos de la receta
            var detalles = await _recetasDetalleRepository.ObtenerDetallesPorRecetaIdAsync(receta.Id);
            if (detalles == null || detalles.Count == 0)
                throw new ArgumentException("La receta no tiene ingredientes; no se puede producir.");

            // 4. Leer materias primas, validar existencia + stock, y acumular costos.
            var materiasPrimas = new Dictionary<string, MateriaPrima>();
            var consumos = new List<MaterialConsumido>();
            double costoTotal = 0;

            foreach (var detalle in detalles)
            {
                var mp = await _materiaPrimaRepository.ObtenerPorIdAsync(detalle.MateriaPrimaId);
                if (mp == null)
                    throw new KeyNotFoundException(
                        $"La materia prima '{detalle.NombreMateriaPrima}' no existe o está inactiva.");

                double requerido = detalle.Cantidad * request.Cantidad;
                if (mp.StockActual < requerido)
                    throw new InvalidOperationException(
                        $"Stock insuficiente de '{mp.Nombre}'. Requerido: {requerido} {mp.Unidad}, " +
                        $"disponible: {mp.StockActual} {mp.Unidad}.");

                materiasPrimas[mp.Id] = mp;
                costoTotal += requerido * mp.CostoPromedioUnitario;

                consumos.Add(new MaterialConsumido
                {
                    MateriaPrimaId = mp.Id,
                    Nombre = mp.Nombre,
                    Cantidad = requerido,
                    Unidad = mp.Unidad,
                    CostoUnitario = mp.CostoPromedioUnitario
                });
            }

            // 5. Batch atómico: descontar stock + transacciones (Salida) + registro de producción.
            var batch = _firestore.StartBatch();
            var ahora = DateTime.UtcNow;

            foreach (var consumo in consumos)
            {
                var mp = materiasPrimas[consumo.MateriaPrimaId];

                var mpRef = _firestore.Collection("materia_prima").Document(mp.Id);
                batch.Update(mpRef, new Dictionary<string, object>
                {
                    { "stock_actual", mp.StockActual - consumo.Cantidad },
                    { "ultima_actualizacion", ahora }
                });

                var transRef = _firestore.Collection("materia_prima_transacciones").Document();
                batch.Set(transRef, new MateriaPrimaTransaccion
                {
                    Id = transRef.Id,
                    MateriaPrimaId = mp.Id,
                    Tipo = "Salida",
                    Cantidad = consumo.Cantidad,
                    CostoUnitario = consumo.CostoUnitario,
                    Fecha = ahora,
                    UsuarioId = usuarioId
                });
            }

            var produccionRef = _firestore.Collection("producciones").Document();
            var produccion = new Produccion
            {
                Id = produccionRef.Id,
                ProductoId = producto.Id,
                NombreProducto = producto.Nombre,
                RecetaId = receta.Id,
                Cantidad = request.Cantidad,
                CostoTotal = costoTotal,
                Estado = "Completada",
                Observaciones = request.Observaciones,
                UsuarioId = usuarioId,
                Fecha = ahora,
                MaterialesConsumidos = consumos
            };
            batch.Set(produccionRef, produccion);

            await batch.CommitAsync();

            return produccion;
        }
    }
}
