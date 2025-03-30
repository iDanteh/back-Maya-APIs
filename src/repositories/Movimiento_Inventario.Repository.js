export class movimiento_inventarioRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll() {
        return await this.model.findAll();
    }

    async findByProductInventoryId(producto_inventario_id) {
        return await this.model.findAll({
            where: { producto_inventario_id }
        });
    }

    async findByMovementType(tipo_movimiento_id) {
        return await this.model.findAll({
            where: { tipo_movimiento_id }
        });
    }

    async createMovement(movementData) {
        return await this.model.create({
            ...movvementData,
            fecha_movimiento: new Date()
        });
    }

    async bulkCreateMovements(movementsData) {
        const transaction = await this.model.sequelize.transaction();
        
        try {
            const results = await this.model.bulkCreate(movementsData, { transaction });
            await transaction.commit();
            return results;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getMovementsByDateRange(startDate, endDate) {
        return await this.model.findAll({
            where: {
                fecha_movimiento: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
    }
}