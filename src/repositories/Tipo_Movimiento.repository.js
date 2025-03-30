export class tipo_movimientoRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll() {
        return await this.model.findAll();
    }

    async findById(tipo_movimiento_id) {
        return await this.model.findByPk(tipo_movimiento_id);
    }

    async findByFactor(factor) {
        return await this.model.findAll({
            where: { factor }
        });
    }

    async createTipoMovimiento(tipoData) {
        return await this.model.create(tipoData);
    }

    async updateTipoMovimiento(tipo_movimiento_id, updateData) {
        const tipo = await this.model.findByPk(tipo_movimiento_id);
        if (!tipo) {
            return null;
        }
        return await tipo.update(updateData);
    }

    async deleteTipoMovimiento(tipo_movimiento_id) {
        const tipo = await this.model.findByPk(tipo_movimiento_id);
        if (!tipo) {
            return false;
        }
        await tipo.destroy();
        return true;
    }
}