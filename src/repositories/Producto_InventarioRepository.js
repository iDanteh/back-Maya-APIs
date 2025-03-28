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
        return await this.model.create(...productData, inventario_id);
    }
    
    async bulkCreateProductsInInventory(inventario_id, productsData) {
        const productsWithInventory = productsData.map(product => ({
            ...product,
            inventario_id // Asegura que todos tengan el mismo inventario_id
        }));
        return await this.model.bulkCreate(productsWithInventory);
    }
    

    // Nuevo método para actualizar existencias
    async updateStock(inventario_id, codigo_barras, lote, nuevasExistencias) {
        return await this.model.update(
            { existencias: nuevasExistencias },
            { where: { inventario_id, codigo_barras, lote: lote } }
        );
    }

    // Método para eliminar un lote de un producto en un inventario
    async deleteLot(inventario_id, codigo_barras, lote) {
        return await this.model.destroy({
            where: { inventario_id, codigo_barras, lote: lote }
        });
    }
}