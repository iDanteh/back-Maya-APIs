import Producto_Inventario from "../models/Producto_Inventario.Model.js";

export const getProductoInventario = async (req, res) => {
    try {
        const productos_inventario = await Producto_Inventario.findAll();
        res.status(200).json(productos_inventario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos_inventario'});
    }
};