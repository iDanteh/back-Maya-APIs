export class MovimientoInventarioRepository {
    constructor(model, tipoMovimientoModel) {
        this.model = model;
        this.tipoMovimientoModel = tipoMovimientoModel;
        this.tipoMovimientoCache = {}; // caché local
    }

    async getTipoMovimientoId(nombre) {
        if (!this.tipoMovimientoCache[nombre]) {
            const tipo = await this.tipoMovimientoModel.findOne({
                where: { descripcion: nombre },
                attributes: ['tipo_movimiento_id']
            });

            if (!tipo) {
                throw new Error(`Tipo de movimiento '${nombre}' no encontrado`);
            }

            this.tipoMovimientoCache[nombre] = tipo.tipo_movimiento_id;
        }

        return this.tipoMovimientoCache[nombre];
    }

    async createMovimiento(producto_inventario_id, tipo_movimiento_nombre, cantidad, referencia, observaciones, options = {}) {
        const tipo_movimiento_id = await this.getTipoMovimientoId(tipo_movimiento_nombre);

        return await this.model.create({
            producto_inventario_id,
            tipo_movimiento_id,
            cantidad,
            referencia,
            observaciones
        }, options);
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
                    attributes: ['codigo_barras'],
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
                    attributes: ['codigo_barras'],
                }
            ],
            raw: true,
        });
    }
}