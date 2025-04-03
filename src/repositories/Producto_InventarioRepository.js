import { Op, Sequelize} from 'sequelize'

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
            // Obtener los productos existentes en una sola consulta
            const existingProducts = await this.model.findAll({
                where: {
                    inventario_id,
                    codigo_barras: productsData.map(p => p.codigo_barras),
                    lote: productsData.map(p => p.lote),
                },
                transaction,
            });
    
            const updates = [];
            const newEntries = [];
    
            for (const product of productsData) {
                const existingProduct = existingProducts.find(
                    p => p.codigo_barras === product.codigo_barras && p.lote === product.lote
                );
    
                if (existingProduct) {
                    existingProduct.existencias += product.existencias;
                    existingProduct.fecha_ultima_actualizacion = new Date();
                    updates.push(existingProduct);

                    // Registrar el detalle de la operación
                    await this.movimientoRepo.createMovimiento(
                        existingProduct.producto_inventario_id,
                        'Entrada',
                        existingProduct.existencias,
                        'Múltiples productos ingresados',
                        `Lote: ${existingProduct.lote}`,
                        { transaction }
                    );
                } else {
                    // Insertar nuevo producto
                    newEntries.push({
                        ...product,
                        inventario_id,
                        fecha_ultima_actualizacion: new Date()
                    },
                    
                );
                }
            }
    
            // Aplicar actualizaciones en lote
            if (updates.length > 0) {
                await Promise.all(updates.map(p => p.save({ transaction })));
            }
    
            // Insertar nuevas entradas en un solo query
            if (newEntries.length > 0) {
                await this.model.bulkCreate(newEntries, { transaction });
            }
    
            await transaction.commit();
            return { updated: updates.length, inserted: newEntries.length };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }    

    // Método para eliminar un lote de un producto en un inventario
    async deleteLot(inventario_id, codigo_barras, lote) {
        const lot = await this.model.findOne({
            where: { inventario_id, codigo_barras, lote }
        });

        if (!lot) {
            throw new Error('Lote no encontrado');
        }

        if (lot.existencias > 0) {
            throw new Error('No se puede eliminar un lote con existencias');
        }

        return await lot.destroy();
    }

    // async transferProduct(source_inventario_id, target_inventario_id, codigo_barras, lote, cantidad, motivo) {
    //     const transaction = await this.model.sequelize.transaction();
    //     try {
    //         // 1. Verificar y reducir existencias en origen
    //         const originProduct = await this.findByBarcodeInInventory(source_inventario_id, codigo_barras, lote);
    //         if (!originProduct || originProduct.existencias < cantidad) {
    //             throw new InventoryError('Existencias insuficientes para transferencia', 400);
    //         }
            
    //         await originProduct.update({
    //             existencias: originProduct.existencias - cantidad
    //         }, { transaction });
            
    //         // 2. Registrar movimiento de salida en origen
    //         await this.movimientoRepo.createMovimiento(
    //             originProduct.producto_inventario_id,
    //             'Salida',
    //             cantidad,
    //             motivo,
    //             `Transferencia a inventario ${target_inventario_id}`,
    //             { transaction }
    //         );
            
    //         // 3. Agregar existencias en destino
    //         const targetProduct = await this.createProductInInventory(
    //             target_inventario_id,
    //             {
    //                 codigo_barras,
    //                 lote,
    //                 existencias: cantidad,
    //                 // otros campos necesarios...
    //             },
    //             { transaction }
    //         );
            
    //         // 4. Registrar movimiento de entrada en destino
    //         await this.movimientoRepo.createMovimiento(
    //             targetProduct.producto_inventario_id,
    //             'Entrada',
    //             cantidad,
    //             motivo,
    //             `Transferencia desde inventario ${source_inventario_id}`,
    //             { transaction }
    //         );
            
    //         await transaction.commit();
    //         return { originProduct, targetProduct };
    //     } catch (error) {
    //         await transaction.rollback();
    //         throw error;
    //     }
    // }
}