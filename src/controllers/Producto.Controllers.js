import Producto from '../models/Producto.Model.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { getPagination } from '../utils/pagination.js';

const productoRepo = new ProductoRepository(Producto);

export const buscarProductos = async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    try {
        const productos = await productoRepo.search(q, 30);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar productos', error });
    }
};

export const getProductos = async (req, res) => {
    try {
        const { all } = req.query;
        let productos;

        if (all === 'true') {
            productos = await productoRepo.findAll();
        } else {
            const { limit, offset } = getPagination(req.query);
            productos = await productoRepo.findAll({ limit, offset });
        }

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al obtener los productos',
            error
        });
    }
};

export const getProductosById = async (req, res) => {
    try {
        const product = await productoRepo.findById(req.params.codigo_barras);

        if (!product) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al obtener el producto',
            error
        });
    }
};

export const createProducto = async (req, res) => {
    try {
        const productData = req.body;

        const productExist = await productoRepo.findById(productData.codigo_barras);
        if (productExist) {
            return res.status(400).json({ message: 'El producto ya existe' });
        }

        const newProduct = await productoRepo.create(productData);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al crear el producto',
            error
        });
    }
};

export const updateProducto = async (req, res) => {
    try {
        const updateProduct = await productoRepo.update(req.params.codigo_barras, req.body);
        if (!updateProduct) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }
        res.json(updateProduct);
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al actualizar el producto',
            error
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const success = await productoRepo.delete(req.params.codigo_barras);
        if (!success) {
            res.status(404).json({
                message: 'Producto no encontrado'
            });
            return;
        }
        res.json({message: 'Producto eliminado correctamente'});
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al eliminar el producto',
            error
        });
    }
};

export const restoreProduct = async (req, res) => {
    try {
        const success = await productoRepo.restore(req.params.codigo_barras);
        if (!success) {
        res.status(404).json({ message: 'Producto no encontrado' });
        return;
        }
        res.json({ message: 'Producto reactivado correctamente' });
    } catch (error) {
        res.status(500).json({
        message: 'Hubo un error al reactivar el producto',
        error: error?.message || error
        });
    }
};
