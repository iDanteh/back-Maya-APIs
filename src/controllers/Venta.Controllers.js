import Venta from '../models/Venta.Model.js';

export const getVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll();
        res.status(200).json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las ventas realizadas' });
    }
};