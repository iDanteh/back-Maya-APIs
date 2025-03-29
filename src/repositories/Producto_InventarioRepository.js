export class producto_inventarioRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll() {
        return await this.model.findAll();
    }

    // Nuevo método para buscar productos por inventario_id
    async findByInventoryId(inventario_id) {
        return await this.model.findAll({
            where: { inventario_id }
        });
    }

    // Nuevo método para buscar un producto específico en un inventario por código de barras
    async findByBarcodeInInventory(inventario_id, codigo_barras) {
        return await this.model.findOne({
            where: { inventario_id, codigo_barras }
        });
    }

    async createProductInInventory(inventario_id, productData) {
        const existingLot = await this.model.findOne({
            where: { inventario_id, codigo_barras: productData.codigo_barras, lote: productData.lote }
        });

        if (existingLot) {
            // Si existe, sumar existencias
            return await existingLot.update({
                existencias: existingLot.existencias + productData.existencias,
                fecha_ultima_actualizacion: new Date()
            });
        } else {
            // Si no existe, crear nuevo
            return await this.model.create({
                ...productData,
                inventario_id
            });
        }
    }
    
    async bulkCreateProductsInInventory(inventario_id, productsData) {
        const transaction = await this.model.sequelize.transaction();

        try {
            const results = [];
            
            for (const product of productsData) {
                // Reutilizamos la lógica del create individual
                const result = await this.createProductInInventory(inventario_id, product, { transaction });
                results.push(result);
            }
            
            await transaction.commit();
            return results;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    

    // Nuevo método para actualizar existencias
    async updateStock(inventario_id, codigo_barras, lote, nuevasExistencias) {
        return await this.model.update(
            { 
                existencias: sequelize.literal(`existencias + ${nuevasExistencias}`),
                fecha_ultima_actualizacion: new Date()
            },
            { 
                where: { inventario_id, codigo_barras, lote } 
            }
        );
    }

    // Método para eliminar un lote de un producto en un inventario
    async deleteLot(inventario_id, codigo_barras, lote) {
        return await this.model.destroy({
            where: { inventario_id, codigo_barras, lote: lote }
        });
    }
}