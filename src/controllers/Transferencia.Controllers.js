import Transferencia from '../models/Transferencia.Model.js';
import Movimiento_Inventario from '../models/Movimiento_Inventario.Model.js';
import { TransferenciaRepository } from '../repositories/Transferencia.Repository.js';
import { getPagination } from '../utils/pagination.js';

const transferenciaRepo = new TransferenciaRepository(Transferencia, Movimiento_Inventario);

export const getTransferencias = async (req, res) => {
    try {
        const { sucursal_id, estado, fecha_inicio, fecha_fin } = req.query;
        const { limit, offset, page } = getPagination(req.query);

        const { count, rows } = await transferenciaRepo.findAll({
            sucursal_id, estado, fecha_inicio, fecha_fin, limit, offset,
        });

        res.json({
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error al obtener las transferencias' });
    }
};

export const getTransferenciaById = async (req, res) => {
    try {
        const { transferencia_id } = req.params;
        const result = await transferenciaRepo.getById(transferencia_id);

        if (!result) {
            return res.status(404).json({ error: 'Transferencia no encontrada' });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error al obtener la transferencia' });
    }
};
