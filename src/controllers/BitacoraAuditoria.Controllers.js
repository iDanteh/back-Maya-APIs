import BitacoraAuditoria from '../models/BitacoraAuditoria.Model.js';
import { BitacoraAuditoriaRepository } from '../repositories/BitacoraAuditoria.Repository.js';
import { getPagination } from '../utils/pagination.js';

const bitacoraRepo = new BitacoraAuditoriaRepository(BitacoraAuditoria);

export const getBitacora = async (req, res) => {
    try {
        const { entidad, accion, resultado, fecha_inicio, fecha_fin } = req.query;
        const { limit, offset, page } = getPagination(req.query);

        const { count, rows } = await bitacoraRepo.findAll({
            entidad, accion, resultado, fecha_inicio, fecha_fin, limit, offset,
        });

        res.json({
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Error al obtener la bitácora de auditoría' });
    }
};
