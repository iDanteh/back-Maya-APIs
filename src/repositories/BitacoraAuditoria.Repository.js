import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const ZONA = 'America/Mexico_City';

export class BitacoraAuditoriaRepository {
    constructor(model) {
        this.model = model;
    }

    // Best-effort a propósito: un fallo al auditar nunca debe tirar abajo la
    // operación real (alta, actualización, transferencia). Si el INSERT falla,
    // se loguea y se devuelve null en vez de relanzar el error.
    async registrar({ entidad, entidad_id, accion, usuario_id, datos_antes, datos_despues, resultado, mensaje_error }) {
        try {
            return await this.model.create({
                entidad,
                entidad_id: entidad_id != null ? String(entidad_id) : null,
                accion,
                usuario_id: usuario_id ?? null,
                datos_antes: datos_antes ?? null,
                datos_despues: datos_despues ?? null,
                resultado,
                mensaje_error: mensaje_error ?? null,
            });
        } catch (error) {
            console.error('Error al registrar en bitácora de auditoría:', error);
            return null;
        }
    }

    async findAll({ entidad, accion, resultado, fecha_inicio, fecha_fin, limit, offset } = {}) {
        const Usuario = this.model.sequelize.models.Usuario;
        const where = {};

        if (entidad) where.entidad = entidad;
        if (accion) where.accion = accion;
        if (resultado) where.resultado = resultado;

        if (fecha_inicio || fecha_fin) {
            // Mismo criterio que Transferencia.Repository.js: interpretar las fechas
            // en calendario de México, no medianoche UTC.
            where.fecha = {};
            if (fecha_inicio) where.fecha[Op.gte] = dayjs.tz(fecha_inicio, ZONA).startOf('day').toDate();
            if (fecha_fin) where.fecha[Op.lte] = dayjs.tz(fecha_fin, ZONA).endOf('day').toDate();
        }

        return await this.model.findAndCountAll({
            where,
            include: [
                { model: Usuario.unscoped(), attributes: ['usuario_id', 'nombre', 'apellido', 'usuario'] },
            ],
            order: [['fecha', 'DESC']],
            limit,
            offset,
        });
    }
}
