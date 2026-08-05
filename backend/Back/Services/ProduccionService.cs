using Back.Entities;
using Back.Models.DTOs.Request;
using Back.Repositories.Interfaces;
using Google.Cloud.Firestore;

namespace Back.Services
{
    public class ProduccionService
    {
        // Estados válidos de una corrida de producción.
        public static readonly string[] EstadosValidos = { "Completada", "En proceso", "Cancelada" };

        private readonly FirestoreDb _firestore;
        private readonly IProductosRepository _productosRepository;
        private readonly IRecetasRepository _recetasRepository;
        private readonly IRecetasDetalleRepository _recetasDetalleRepository;
        private readonly IMateriaPrimaRepository _materiaPrimaRepository;
        private readonly IProduccionRepository _produccionRepository;

        public ProduccionService(
            FirestoreDb firestore,
            IProductosRepository productosRepository,
            IRecetasRepository recetasRepository,
            IRecetasDetalleRepository recetasDetalleRepository,
            IMateriaPrimaRepository materiaPrimaRepository,
            IProduccionRepository produccionRepository)
        {
            _firestore = firestore;
            _productosRepository = productosRepository;
            _recetasRepository = recetasRepository;
            _recetasDetalleRepository = recetasDetalleRepository;
            _materiaPrimaRepository = materiaPrimaRepository;
            _produccionRepository = produccionRepository;
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

        // Cambia el estado de una producción. Ajusta el inventario según la transición:
        //  - Activa (Completada / En proceso) -> Cancelada: devuelve la materia prima al stock (Entrada).
        //  - Cancelada -> activa: vuelve a descontar la materia prima (Salida), validando disponibilidad.
        //  - Entre dos estados activos: solo cambia la etiqueta, sin tocar inventario.
        // Todo se aplica en un batch atómico de Firestore.
        public async Task<Produccion> CambiarEstadoAsync(string id, string nuevoEstado, string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(nuevoEstado) || !EstadosValidos.Contains(nuevoEstado))
                throw new ArgumentException(
                    $"Estado no válido. Estados permitidos: {string.Join(", ", EstadosValidos)}.");

            var produccion = await _produccionRepository.ObtenerPorIdAsync(id);
            if (produccion == null)
                throw new KeyNotFoundException("La producción no existe.");

            var estadoAnterior = produccion.Estado;
            if (estadoAnterior == nuevoEstado)
                return produccion; // Sin cambios.

            bool eraCancelada = estadoAnterior == "Cancelada";
            bool seraCancelada = nuevoEstado == "Cancelada";

            var batch = _firestore.StartBatch();
            var ahora = DateTime.UtcNow;

            if (!eraCancelada && seraCancelada)
            {
                // Devolver la materia prima consumida al inventario.
                foreach (var consumo in produccion.MaterialesConsumidos)
                {
                    var mp = await _materiaPrimaRepository.ObtenerPorIdAsync(consumo.MateriaPrimaId);
                    if (mp == null)
                        continue; // El material ya no existe; no hay a dónde devolver el stock.

                    var mpRef = _firestore.Collection("materia_prima").Document(mp.Id);
                    batch.Update(mpRef, new Dictionary<string, object>
                    {
                        { "stock_actual", mp.StockActual + consumo.Cantidad },
                        { "ultima_actualizacion", ahora }
                    });

                    var transRef = _firestore.Collection("materia_prima_transacciones").Document();
                    batch.Set(transRef, new MateriaPrimaTransaccion
                    {
                        Id = transRef.Id,
                        MateriaPrimaId = mp.Id,
                        Tipo = "Entrada",
                        Cantidad = consumo.Cantidad,
                        CostoUnitario = consumo.CostoUnitario,
                        Fecha = ahora,
                        UsuarioId = usuarioId
                    });
                }
            }
            else if (eraCancelada && !seraCancelada)
            {
                // Reactivar: volver a descontar la materia prima. Validar disponibilidad primero.
                var materiasPrimas = new Dictionary<string, MateriaPrima>();
                foreach (var consumo in produccion.MaterialesConsumidos)
                {
                    var mp = await _materiaPrimaRepository.ObtenerPorIdAsync(consumo.MateriaPrimaId);
                    if (mp == null)
                        throw new KeyNotFoundException(
                            $"La materia prima '{consumo.Nombre}' ya no existe; no se puede reactivar la producción.");
                    if (mp.StockActual < consumo.Cantidad)
                        throw new InvalidOperationException(
                            $"Stock insuficiente de '{mp.Nombre}' para reactivar. Requerido: {consumo.Cantidad} {mp.Unidad}, " +
                            $"disponible: {mp.StockActual} {mp.Unidad}.");
                    materiasPrimas[mp.Id] = mp;
                }

                foreach (var consumo in produccion.MaterialesConsumidos)
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
            }
            // Transición entre dos estados activos: no se toca el inventario.

            var produccionRef = _firestore.Collection("producciones").Document(id);
            batch.Update(produccionRef, new Dictionary<string, object>
            {
                { "estado", nuevoEstado }
            });

            await batch.CommitAsync();

            produccion.Estado = nuevoEstado;
            return produccion;
        }
    }
}
