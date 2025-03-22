import Proveedor from '../models/Proveedor.Model.js';

export const getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll();
        res.status(200).json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proveedores' });
    }
};