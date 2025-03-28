export class ProductoRepository {

    constructor(model) {
        this.model = model;
    }

    async findAll() {
        return await this.model.findAll();
    }

    async findById(id) {
        return await this.model.findByPk(id);
    }

    async create(productData) {
        return await this.model.create(productData);
    }

    async update(id, productData) {
        const product = await this.model.findByPk(id);
        if (!product) return null;
        return await product.update(productData);
    }

    async delete(id) {
        const product = await this.model.findByPk(id);
        if (!product) return false;
        await product.destroy();
        return true;
    }
}