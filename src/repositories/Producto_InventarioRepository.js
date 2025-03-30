export class producto_inventarioRepository {
    constructor(model, movimientoRepo) {
        this.model = model;
        this.movimientoRepo = movimientoRepo;
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

    async createProductInInventory(inventario_id, productData, transactionOptions = {}) {
        const transaction = transactionOptions.transaction;

        const existingLot = await this.model.findOne({
            where: { inventario_id, codigo_barras: productData.codigo_barras, lote: productData.lote },
            transaction
        });

        let result;
        if (existingLot) {
            result = await existingLot.update({
                existencias: existingLot.existencias + productData.existencias,
                fecha_ultima_actualizacion: new Date()
            }, { transaction });

            // Registrar movimiento de ENTRADA
            await this.movimientoRepo.createMovimiento(
                existingLot.producto_inventario_id,
                'Entrada',
                productData.existencias,
                'Reabastecimiento de inventario',
                `Lote: ${productData.lote}`,
                { transaction }
            );
        } else {
            result = await this.model.create({
                ...productData,
                inventario_id
            }, { transaction });

            // Registrar movimiento de ENTRADA
            await this.movimientoRepo.createMovimiento(
                result.producto_inventario_id,
                'Entrada',
                productData.existencias,
                'Nuevo lote ingresado',
                `Lote: ${productData.lote}`,
                { transaction }
            );
        }
        return result;
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
    async updateStock(inventario_id, codigo_barras, lote, cantidad) {
        const transaction = await this.model.sequelize.transaction();
        try {
            const producto = await this.model.findOne({
                where: { inventario_id, codigo_barras, lote },
                transaction
            });

            if (!producto) throw new Error('Producto no encontrado');

            await producto.update(
                { existencias: sequelize.literal(`existencias + ${cantidad}`) },
                { transaction }
            );

            // Registrar movimiento de AJUSTE
            await this.movimientoRepo.createMovimiento(
                producto.producto_inventario_id,
                cantidad > 0 ? 'Entrada' : 'Salida',
                Math.abs(cantidad),
                'Ajuste de inventario',
                `Ajuste manual: ${cantidad} unidades`,
                { transaction }
            );

            await transaction.commit();
            return producto;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Método para eliminar un lote de un producto en un inventario
    async deleteLot(inventario_id, codigo_barras, lote) {
        return await this.model.destroy({
            where: { inventario_id, codigo_barras, lote: lote }
        });
    }
}