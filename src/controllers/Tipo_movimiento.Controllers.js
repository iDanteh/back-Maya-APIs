import Tipo_Movimiento from '../models/Tipo_Movimiento.Model.js';

export const getTipoMovimiento = async (req, res) => {
    try {
        const tiposMovimientos = await Tipo_Movimiento.findAll();
        res.status(200).json(tiposMovimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los tipos de movimientos existentes' });
    }
};