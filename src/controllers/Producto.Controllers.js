import Producto from '../models/Producto.Model.js';

export const getProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll();
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            message: 'Hubo un error al obtener los productos',
            error
        });
    }
};