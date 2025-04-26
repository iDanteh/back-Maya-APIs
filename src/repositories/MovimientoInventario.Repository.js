import tipoMovimientoModel from '../models/Tipo_Movimiento.Model.js';
import Producto_Inventario from '../models/Producto_Inventario.Model.js';

export class MovimientoInventarioRepository {
    constructor(model, tipoMovimientoModel) {
        this.model = model;
        this.tipoMovimientoModel = tipoMovimientoModel;
    }

    async createMovimiento(producto_inventario_id, tipo_movimiento_nombre, cantidad, referencia, observaciones) {
        const tipoMovimiento = await this.tipoMovimientoModel.findOne({
            where: { descripcion: tipo_movimiento_nombre }
        });

        if (!tipoMovimiento) {
            throw new Error(`Tipo de movimiento '${tipo_movimiento_nombre}' no encontrado`);
        }

        return await this.model.create({
            producto_inventario_id,
            tipo_movimiento_id: tipoMovimiento.tipo_movimiento_id,
            cantidad,
            referencia,
            observaciones
        });
    }

    async createBulkMovimientos(movimientosData) {
        return await this.model.bulkCreate(movimientosData);
    }

    async getEntradasBySucursal(sucursal_id) {
        return await this.model.findAll({
            include: [
                {
                    model: this.tipoMovimientoModel,
                    where: { descripcion: 'Entrada' },
                    attributes: [],
                },
                {
                    model: this.model.sequelize.models.Producto_Inventario,
                    where: { sucursal_id },
                    attributes: ['codigo_barras'], // Definimos los campos que queremos añadir
                }
            ],
            raw: true,
        });
    }
    
    async getSalidasBySucursal(sucursal_id) {
        return await this.model.findAll({
            include: [
                {
                    model: this.tipoMovimientoModel,
                    where: { descripcion: 'Salida' },
                    attributes: [],
                },
                {
                    model: this.model.sequelize.models.Producto_Inventario,
                    where: { sucursal_id },
                    attributes: ['codigo_barras'], // Definimos los campos que queremos añadir
                }
            ],
            raw: true,
        });
    }
}