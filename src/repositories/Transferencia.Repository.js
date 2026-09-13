import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const ZONA = 'America/Mexico_City';

export class TransferenciaRepository {
    constructor(model, movimientoModel) {
        this.model = model;
        this.movimientoModel = movimientoModel;
    }

    async getById(transferencia_id) {
        const Usuario = this.model.sequelize.models.Usuario;
        const Sucursal = this.model.sequelize.models.Sucursal;
        const Producto_Inventario = this.model.sequelize.models.Producto_Inventario;
        const Tipo_Movimiento = this.model.sequelize.models.Tipo_Movimiento;

        const transferencia = await this.model.findByPk(transferencia_id, {
            include: [
                {
                    // unscoped: es un registro de auditoría, tiene que mostrar quién hizo
                    // la transferencia aunque ese usuario haya sido desactivado despues
                    // (Usuario tiene defaultScope is_active:true).
                    model: Usuario.unscoped(),
                    attributes: ['usuario_id', 'nombre', 'apellido', 'usuario'],
                },
                { model: Sucursal, as: 'sucursalOrigen', attributes: ['sucursal_id', 'nombre'] },
                { model: Sucursal, as: 'sucursalDestino', attributes: ['sucursal_id', 'nombre'] },
            ],
        });

        if (!transferencia) return null;

        const movimientos = await this.movimientoModel.findAll({
            where: { transferencia_id },
            include: [
                { model: Producto_Inventario, attributes: ['codigo_barras', 'lote', 'sucursal_id'] },
                { model: Tipo_Movimiento, attributes: ['descripcion'] },
            ],
            order: [['movimiento_id', 'ASC']],
        });

        return { transferencia, movimientos };
    }

    async findAll({ sucursal_id, estado, fecha_inicio, fecha_fin, limit, offset } = {}) {
        const Usuario = this.model.sequelize.models.Usuario;
        const Sucursal = this.model.sequelize.models.Sucursal;

        const where = {};

        if (sucursal_id) {
            where[Op.or] = [
                { sucursal_origen_id: sucursal_id },
                { sucursal_destino_id: sucursal_id },
            ];
        }

        if (estado) {
            where.estado = estado;
        }

        if (fecha_inicio || fecha_fin) {
            // fecha_inicio/fecha_fin llegan como YYYY-MM-DD sin hora. dayjs.tz(...) las
            // interpreta como calendario local (America/Mexico_City, mismo criterio que
            // MetricasRepository.js) en vez de medianoche UTC — mezclar new Date() (UTC)
            // con setHours() (local) desalinea el rango por las 6h de diferencia.
            where.fecha_transferencia = {};
            if (fecha_inicio) where.fecha_transferencia[Op.gte] = dayjs.tz(fecha_inicio, ZONA).startOf('day').toDate();
            if (fecha_fin) where.fecha_transferencia[Op.lte] = dayjs.tz(fecha_fin, ZONA).endOf('day').toDate();
        }

        return await this.model.findAndCountAll({
            where,
            include: [
                { model: Usuario.unscoped(), attributes: ['usuario_id', 'nombre', 'apellido', 'usuario'] },
                { model: Sucursal, as: 'sucursalOrigen', attributes: ['sucursal_id', 'nombre'] },
                { model: Sucursal, as: 'sucursalDestino', attributes: ['sucursal_id', 'nombre'] },
            ],
            order: [['fecha_transferencia', 'DESC']],
            limit,
            offset,
        });
    }
}
