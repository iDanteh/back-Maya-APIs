import Movimiento_Inventario from '../models/Movimiento_Inventario.Model.js';

export const getMovimientos = async (req, res) => {
    try {
        const movimientos = await Movimiento_Inventario.findAll();
        res.status(200).json(movimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los movimientos realizados' });
    }
};