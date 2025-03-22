import Sucursal from '../models/Sucursal.Model.js';

export const getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.findAll();
        res.status(200).json(sucursales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las sucursales' });
    }
};