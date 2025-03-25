import Detalle_Venta from '../models/Detalle_Venta.Model.js';
export const getDetalleVenta = async (req, res) => {
    try {
        const detalle_venta = await Detalle_Venta.findAll();
        res.status(200).json(detalle_venta);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle de las ventas realizadas' });
    }
};