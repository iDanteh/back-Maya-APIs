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
}