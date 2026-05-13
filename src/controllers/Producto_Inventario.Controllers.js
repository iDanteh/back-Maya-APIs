import Producto_Inventario from "../models/Producto_Inventario.Model.js";
import { producto_inventarioRepository } from '../repositories/Producto_InventarioRepository.js'
import Movimiento_Inventario from '../models/Movimiento_Inventario.Model.js';
import Producto from "../models/Producto.Model.js";
import Tipo_Movimiento from '../models/Tipo_Movimiento.Model.js';
import { MovimientoInventarioRepository } from '../repositories/MovimientoInventario.Repository.js'
import { getPagination } from '../utils/pagination.js';

const movimientoRepo = new MovimientoInventarioRepository(Movimiento_Inventario ,Tipo_Movimiento);
const repoProductoInventario = new producto_inventarioRepository(Producto_Inventario, movimientoRepo);

// Devuelve solo los registros de una sucursal que cambiaron desde ?since=<ISO>
// El front guarda el syncedAt devuelto y lo usa en la próxima llamada.
export const getSyncInventario = async (req, res) => {
    try {
        const { sucursal_id } = req.params;
        const since = req.query.since ? new Date(req.query.since) : new Date(0);

        const changes = await repoProductoInventario.findChangedSince(sucursal_id, since);

        res.json({
            data: changes,
            syncedAt: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductoInventario = async (req, res) => {
    try {
        const { sucursal_id } = req.query;
        if (!sucursal_id) {
            return res.status(400).json({ error: 'El parámetro sucursal_id es requerido' });
        }
        const { limit, offset } = getPagination(req.query);
        const where = { sucursal_id };
        const productos_inventario = await Producto_Inventario.findAll({ where, limit, offset });
        res.status(200).json(productos_inventario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos_inventario'});
    }
};

export const getProductsByInventory = async (req, res) => {
    try {
        const { sucursal_id } = req.params;

        // Carga completa en un solo request. Recomendado hasta ~8K filas por sucursal.
        // syncedAt se captura ANTES de la query para que el cliente lo use como punto
        // de corte del próximo delta sync sin riesgo de dejar huecos.
        if (req.query.all === 'true') {
            const syncedAt = new Date().toISOString();
            const productos = await repoProductoInventario.findAllByInventoryId(sucursal_id);
            return res.json({ data: productos, total: productos.length, syncedAt });
        }

        // Ruta paginada — queda como fallback para inventarios fuera del umbral.
        const { limit, offset, page } = getPagination(req.query);
        const isFirstPage = page === 1;
        const syncedAt = isFirstPage ? new Date().toISOString() : undefined;

        const { count, rows: productos } = await repoProductoInventario.findByInventoryId(
            sucursal_id,
            { limit, offset, skipCount: !isFirstPage }
        );

        const response = { data: productos, page };
        if (isFirstPage) {
            response.total = count;
            response.totalPages = Math.ceil(count / limit);
            response.syncedAt = syncedAt;
        }

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFaltantesProductsByInventory = async (req, res) => {
    try {
        const { sucursal_id } = req.params;
        const productos = await repoProductoInventario.findFaltantesByInventoryId(sucursal_id);

        const productosSinStock = productos.filter(producto => producto.existencias === 0 || producto.existencias === null || producto.existencias <= 5);

        res.json(productosSinStock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchProduct = async (req, res) => {
    try {
        const { sucursal_id, codigo_barras } = req.params;

        const producto = await Producto.scope("withInactive").findByPk(codigo_barras);

        if (!producto) {
        return res.status(404).json({
            code: "PRODUCTO_NO_EN_SERVIDOR",
            message: "El código de barras no está dado de alta en el servidor (catálogo de productos).",
        });
        }

        const rows = await repoProductoInventario.findByBarcodeInInventory(
        sucursal_id,
        codigo_barras
        );

        const lotsWithStock = (rows || []).filter(r => Number(r.existencias || 0) > 0);

        return res.status(200).json(lotsWithStock);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Error interno al consultar el producto.",
        });
    }
};

export const addProductToInventory = async (req, res) => {
    try {
        const { sucursal_id } = req.params;
        const productData = {
            ...req.body,
            sucursal_id
        };

        const newProduct = await repoProductoInventario.createProductInInventory(sucursal_id, productData);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al agregar el producto al inventario',
            details: error.message 
        });
    }
};

export const addMultipleProductsToInventory = async (req, res) => {
    try {

        const { sucursal_id } = req.params;
        const productsData = req.body.productos;

        if (!Array.isArray(productsData)) {
            return res.status(400).json({ error: "El campo 'productos' debe ser un array." });
        }

        const invalidProducts = productsData.filter( product => !Number.isInteger(product.existencias) || product.existencias <= 0);
        
        if( invalidProducts.length > 0){
            return res.status(400).json({
                error: "Las existencias deben ser tipos de datos enteros y no negativos",
                invalidProducts,
            });
        }

        const result = await repoProductoInventario.bulkCreateProductsInInventory(sucursal_id, productsData);
        res.status(201).json({ message: 'Productos procesados correctamente', data: result });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                code: 'DUPLICATE_PRODUCTO_INVENTARIO',
                error: 'Ya existe un registro activo con ese código de barras, lote y fecha de caducidad en esta sucursal.',
            });
        }
        res.status(500).json({
            error: 'Error al agregar múltiples productos al inventario',
            details: error.message
        });
    }
};


export const deleteLot = async (req, res) => {
    try {
        const { sucursal_id, codigo_barras, lote } = req.params;
        const result = await repoProductoInventario.deleteLot(sucursal_id, codigo_barras, lote);

        if (result.ok === false) {
            if (result.reason === 'NOT_FOUND') {
                return res.status(404).json({ error: `Lote "${lote}" no encontrado en la sucursal ${sucursal_id}.` });
            }
            if (result.reason === 'HAS_STOCK') {
                return res.status(409).json({
                    error: `No se puede eliminar el lote "${lote}": tiene ${result.lot?.existencias ?? '?'} unidad(es) en existencia. Agota el stock antes de eliminar.`,
                });
            }
            return res.status(400).json({ error: 'No se pudo eliminar el lote.' });
        }

        if (result.alreadyInactive) {
            return res.json({ message: 'El lote ya estaba inactivo.', lote: result.lot });
        }

        res.json({ message: 'Lote desactivado correctamente.', lote: result.lot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProductData = async (req, res) => {
    try {
        const updateProduct = await repoProductoInventario.update(req.params.producto_inventario_id, req.body);
        if (!updateProduct) {
            return res.status(400).json({ error: 'Producto no encontrado'});
        }
        res.status(200).json(updateProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const transferirProducto = async (req, res) => {
    const {
        source_sucursal_id,
        target_sucursal_id,
        codigo_barras,
        lote,
        cantidad,
        motivo
    } = req.body;

    try {
        const result = await repoProductoInventario.transferProduct(
            source_sucursal_id,
            target_sucursal_id,
            codigo_barras,
            lote,
            cantidad,
            motivo
        );

        return res.status(200).json({
            mensaje: 'Transferencia realizada con éxito',
            origen: result.originProduct,
            destino: result.targetProduct
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
};

export const transferirMultiplesProductos = async (req, res) => {
    const { source_sucursal_id, productos } = req.body;

    if (!source_sucursal_id || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Datos incompletos para la transferencia' });
    }

    const invalidProducts = productos.filter( product => !Number.isInteger(product.cantidad) || product.cantidad <= 0)

    if (invalidProducts.length > 0){
        return res.status(400).json({
            error: "Las cantidades deben ser tipos de datos enteres y no negativos",
            invalidProducts
        });
    }

    try {
        const result = await repoProductoInventario.transferProductBulk(
        source_sucursal_id,
        productos
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error en la transferencia múltiple' });
    }
}