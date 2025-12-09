import Producto_Inventario from "../models/Producto_Inventario.Model.js";
import { producto_inventarioRepository } from '../repositories/Producto_InventarioRepository.js'
import Movimiento_Inventario from '../models/Movimiento_Inventario.Model.js';
import Tipo_Movimiento from '../models/Tipo_Movimiento.Model.js';
import { MovimientoInventarioRepository } from '../repositories/MovimientoInventario.Repository.js'

const movimientoRepo = new MovimientoInventarioRepository(Movimiento_Inventario ,Tipo_Movimiento);
const repoProductoInventario = new producto_inventarioRepository(Producto_Inventario, movimientoRepo);

export const getProductoInventario = async (req, res) => {
    try {
        const productos_inventario = await Producto_Inventario.findAll();
        res.status(200).json(productos_inventario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos_inventario'});
    }
};

export const getProductsByInventory = async (req, res) => {
    try {
        const { sucursal_id } = req.params;
        const productos = await repoProductoInventario.findByInventoryId(sucursal_id);

        const productosSinStock = productos.filter(producto => producto.existencias === 0);

        await Promise.all(productosSinStock.map(async (producto) => {
            try {
                await repoProductoInventario.deleteLot(sucursal_id, producto.codigo_barras, producto.lote);
                console.log('Lote eliminado:', producto.lote, 'por cantidad de existencias 0');
            } catch (error) {
                console.error(`Error eliminando lote ${producto.lote}:`, error.message);
            }
        }));

        const productosConStock = productos.filter(producto => producto.existencias > 0);

        res.json(productosConStock);
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
        const producto = await repoProductoInventario.findByBarcodeInInventory(sucursal_id, codigo_barras);
        
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado en este inventario' });
        }
        
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        const productsData = req.body.productos; // Accede correctamente a los productos

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
        console.log(productsData);
        res.status(201).json({ message: 'Productos procesados correctamente', data: result });
    } catch (error) {
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
        res.json({ message: 'Lote eliminado correctamente' });
    } catch (error) {
        if (error.message.includes('No se puede eliminar')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
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

    console.log(req.body);

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