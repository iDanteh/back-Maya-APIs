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

    // MovimientoInventarioRepository.js
    async createMovimiento(payload, options = {}) {
        const {
            producto_inventario_id,
            tipo_movimiento_nombre,
            cantidad,
            referencia,
            observaciones,
            codigo_barras: cbParam,
            lote: loteParam,
            sucursal_id
        } = payload;

        const tipo_movimiento_id = await this.getTipoMovimientoId(tipo_movimiento_nombre);

        // Preferir datos explícitos si vienen:
        let codigo_barras = cbParam || null;
        let lote = loteParam || null;

        // Si falta alguno, intentar resolverlo por producto_inventario_id
        if ((!codigo_barras || !lote) && producto_inventario_id) {
            const producto = await this.model.sequelize.models.Producto_Inventario.findByPk(producto_inventario_id);
            if (producto) {
            codigo_barras = codigo_barras || producto.codigo_barras;
            lote = lote || producto.lote;
            }
        }

        const refParts = [];
        if (referencia && referencia.trim()) refParts.push(referencia.trim());
        refParts.push(`Código: ${codigo_barras || '-'}`);
        refParts.push(`Lote: ${lote || '-'}`);
        const referenciaFinal = refParts.join(' | ');

        return await this.model.create({
            producto_inventario_id,
            tipo_movimiento_id,
            cantidad,
            referencia: referenciaFinal,
            observaciones,
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
                attributes: ['codigo_barras', 'sucursal_id', 'is_active'],
                required: true,
            }
            ],
            order: [['fecha_movimiento', 'DESC']],
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
                attributes: ['codigo_barras', 'sucursal_id', 'is_active'],
                required: true,
            },
            ],
            order: [['fecha_movimiento', 'DESC']],
            raw: true,
        });
        }

}