import Detalle_Venta from '../models/Detalle_Venta.Model.js';
import { detalle_VentaRepository } from '../repositories/DetalleVentaRepository.js';

const detalleRepository = new detalle_VentaRepository(Detalle_Venta);

export const getDetalleVenta = async (req, res) => {
    try {
        const detalle_venta = await Detalle_Venta.findAll();
        res.status(200).json(detalle_venta);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle de las ventas realizadas' });
    }
};

export const getVentaById = async (req, res) => {
    try {
        const { venta_id } = req.params;
        const venta = await detalleRepository.findVentaById(venta_id);

        if(!venta){
            return res.status(404).json({ message: 'Venta no encontrada'});
        }

        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle de las ventas realizadas' });
    }
}