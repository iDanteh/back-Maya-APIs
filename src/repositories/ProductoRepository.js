export class ProductoRepository {

    constructor(model) {
        this.model = model;
    }

    async findAll() {
        return this.model.findAll();
    }

    async findById(codigo_barras) {
        return await this.model.findByPk(codigo_barras);
    }

    async create(productData) {
        return await this.model.create(productData);
    }

    async update(codigo_barras, productData) {
        try {
            const product = await this.model.findByPk(codigo_barras);
            if (!product) return null;
            if (product.precio_maximo !== productData.precio_maximo) {
                productData.precio_max_anterior = product.precio_maximo;
                productData.fecha_updt_precio = new Date();
            }

            return await product.update(productData);
        } catch (error) {
            console.log('Error al actualizar el producto:', error);
            return false;
        }
    }

    async delete(codigo_barras) {
        const product = await this.model.scope('withInactive').findByPk(codigo_barras);
        if (!product) return false;

        if (product.is_active === false) {
        return true;
        }

        await product.update({ is_active: false });
        return true;
    }

    async restore(codigo_barras) {
        const product = await this.model.scope('withInactive').findByPk(codigo_barras);
        if (!product) return false;
        await product.update({ is_active: true });
        return true;
    }
}