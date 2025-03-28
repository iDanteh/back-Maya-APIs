import Producto_Inventario from "../models/Producto_Inventario.Model.js";
import { producto_inventarioRepository } from '../repositories/Producto_InventarioRepository.js'

const repoProductoInventario = new producto_inventarioRepository(Producto_Inventario);

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
        const { inventario_id } = req.params;
        const productos = await repoProductoInventario.findByInventoryId(inventario_id);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchProduct = async (req, res) => {
    try {
        const { inventario_id, codigo_barras } = req.params;
        const producto = await repoProductoInventario.findByBarcodeInInventory(inventario_id, codigo_barras);
        
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
        const { inventario_id } = req.params;
        const productData = {
            ...req.body,
            fecha_ultima_actualizacion: new Date(), // Actualizar la fecha automáticamente
            inventario_id
        };

        const newProduct = await repoProductoInventario.createProductInInventory(inventario_id, productData);
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
        const { inventario_id } = req.params;
        const productsData = req.body.map(product => ({
            ...product,
            fecha_ultima_actualizacion: new Date(), // Actualizar la fecha automáticamente
            inventario_id
        }));

        const createdProducts = await repoProductoInventario.bulkCreateProductsInInventory(inventario_id, productsData);
        res.status(201).json({
            message: `${createdProducts.length} productos agregados al inventario`,
            products: createdProducts
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al agregar múltiples productos al inventario',
            details: error.message 
        });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { inventario_id, codigo_barras, lote } = req.params;
        const { existencias } = req.body;
        
        const result = await repoProductoInventario.updateStock(inventario_id, codigo_barras, lote, existencias);
        
        if (result[0] === 0) {
            return res.status(404).json({ message: 'Producto no encontrado en este inventario o datos sin cambios' });
        }
        
        res.json({ message: 'Existencias actualizadas correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteLot = async (req, res) => {
    try {
        const { inventario_id, codigo_barras, existencias, lote } = req.params;
        
        // Verificar si el lote tiene existencias antes de eliminarlo
        if( existencias != 0 ){
            return res.status(400).json({ message: 'No se puede eliminar un lote con existencias' });
        }
        const result = await repoProductoInventario.deleteLot(inventario_id, codigo_barras, lote);
        
        if (result === 0) {
            return res.status(404).json({ message: 'Lote no encontrado en este inventario' });
        }
        
        res.json({ message: 'Lote eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};