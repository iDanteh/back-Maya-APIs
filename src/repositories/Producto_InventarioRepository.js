import { Op, Sequelize} from 'sequelize'
import Producto from '../models/Producto.Model.js';
import Categoria from '../models/Categoria.Model.js';

export class producto_inventarioRepository {
    constructor(model, movimientoRepo) {
        this.model = model;
        this.movimientoRepo = movimientoRepo;
    }

    async findAll() {
        return await this.model.findAll();
    }

    // Nuevo método para buscar productos por sucursal_id
    // Actualización para obtener también la información de los productos
    async findByInventoryId(sucursal_id) {
        return await this.model.findAll({
            where: { sucursal_id, is_active: true },
            include: [
                {
                    model: Producto,
                    attributes: { exclude: []},
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto']
                        }
                    ]
                }
            ]
        });
    }

    async findFaltantesByInventoryId(sucursal_id) {
        return await this.model.findAll({
            where: { sucursal_id },
            include: [
                {
                    model: Producto,
                    attributes: { exclude: []},
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto']
                        }
                    ]
                }
            ]
        });
    }

    // Nuevo método para buscar un producto específico en un inventario por código de barras
    async findByBarcodeInInventory(sucursal_id, codigo_barras) {
        return await this.model.findAll({
            where: { sucursal_id, codigo_barras },
            include: [
                {
                    model: Producto,
                    attributes: { exclude: []},
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto']
                        }
                    ]
                }
            ]
        });
    }

    async createProductInInventory(sucursal_id, productData, options = {}) {
        const { transaction, logMovimiento = true } = options;

        const existingLot = await this.model.findOne({
            where: { sucursal_id, codigo_barras: productData.codigo_barras, lote: productData.lote },
            transaction
        });

        let result;
        if (existingLot) {
            result = await existingLot.update({
            existencias: existingLot.existencias + productData.existencias,
            fecha_ultima_actualizacion: new Date()
            }, { transaction });

            if (logMovimiento) {
            await this.movimientoRepo.createMovimiento({
                producto_inventario_id: existingLot.producto_inventario_id,
                tipo_movimiento_nombre: 'Entrada',
                cantidad: productData.existencias,
                referencia: `Lote: ${productData.lote}`,
                observaciones: 'Reabastecimiento de inventario',
                codigo_barras: existingLot.codigo_barras,
                lote: existingLot.lote,
                sucursal_id
            }, { transaction });
            }

        } else {
            result = await this.model.create({
            ...productData,
            sucursal_id,
            fecha_ultima_actualizacion: new Date()
            }, { transaction });

            if (logMovimiento) {
            await this.movimientoRepo.createMovimiento({
                producto_inventario_id: result.producto_inventario_id,
                tipo_movimiento_nombre: 'Entrada',
                cantidad: productData.existencias,
                referencia: `Lote: ${productData.lote}`,
                observaciones: 'Nuevo lote ingresado',
                // <<< evita N/A:
                codigo_barras: productData.codigo_barras,
                lote: productData.lote,
                sucursal_id
            }, { transaction });
            }
        }
        return result;
    }

    async bulkCreateProductsInInventory(sucursal_id, productsData) {
        const transaction = await this.model.sequelize.transaction();
        try {
            const orConditions = productsData.map(p => ({
                sucursal_id,
                codigo_barras: p.codigo_barras,
                lote: p.lote
            }));
        
            const existingProducts = await this.model.findAll({
                where: { [Op.or]: orConditions },
                transaction,
            });
        
            const updates = [];
            const newEntries = [];
        
            for (const product of productsData) {
                const existingProduct = existingProducts.find(
                    p => p.codigo_barras === product.codigo_barras && 
                        p.lote === product.lote && 
                        p.sucursal_id === sucursal_id
                );
        
                if (existingProduct) {
                    existingProduct.existencias += product.existencias;
                    existingProduct.fecha_ultima_actualizacion = new Date();
                    updates.push(existingProduct);
        
                    await this.movimientoRepo.createMovimiento({
                        producto_inventario_id: existingProduct.producto_inventario_id,
                        tipo_movimiento_nombre: 'Entrada',
                        cantidad: product.existencias,
                        referencia: `Lote: ${existingProduct.lote}`,
                        observaciones: 'Abastecimiento del inventario',
                        codigo_barras: existingProduct.codigo_barras,
                        lote: existingProduct.lote,
                        sucursal_id
                    }, { transaction });

                } else {
                    newEntries.push({
                        ...product,
                        sucursal_id,
                        fecha_ultima_actualizacion: new Date()
                    });
                }
            }
        
            if (updates.length > 0) {
                await Promise.all(updates.map(p => p.save({ transaction })));
            }
        
            // Crear nuevos productos y registrar movimiento
            for (const newProduct of newEntries) {
                const createdProduct = await this.model.create(newProduct, { transaction });
                await this.movimientoRepo.createMovimiento({
                    producto_inventario_id: createdProduct.producto_inventario_id,
                    tipo_movimiento_nombre: 'Entrada',
                    cantidad: newProduct.existencias,
                    referencia: `Lote: ${newProduct.lote}`,
                    observaciones: 'Nuevo lote ingresado',
                    codigo_barras: newProduct.codigo_barras,
                    lote: newProduct.lote,
                    sucursal_id
                }, { transaction });
            }
        
            await transaction.commit();
            return { updated: updates.length, inserted: newEntries.length };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Método para eliminar un lote de un producto en un inventario
    async deleteLot(sucursal_id, codigo_barras, lote) {
        const lot = await this.model.findOne({
            where: { sucursal_id, codigo_barras, lote, is_active: true }
        });

        if (!lot) throw new Error('Lote no encontrado');
        if (lot.existencias > 0) throw new Error('No se puede eliminar un lote con existencias');

        // Marcar como inactivo
        lot.is_active = false;
        await lot.save();

        return lot;
    }

    async update(producto_inventario_id, productData) {
        const transaction = await this.model.sequelize.transaction();
        try {
            const product = await this.model.findByPk(producto_inventario_id);
            if (!product) {
            await transaction.rollback();
            return null;
            }

            await this.movimientoRepo.createMovimiento({
            producto_inventario_id: product.producto_inventario_id,
            tipo_movimiento_nombre: 'Actualizacion manual del inventario',
            cantidad: product.existencias,
            referencia: 'Actualización en la información del producto',
            observaciones: 'Actualización en la información del producto',
            lote: product.lote,
            codigo_barras: product.codigo_barras ?? null,
            sucursal_id: product.sucursal_id ?? null,
            }, { transaction });

            const updated = await product.update(productData, { transaction });

            await transaction.commit();
            return updated;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }


    async findProductByInventory (sucursal_id, codigo_barras, lote){
        const find = await this.model.findOne({
            where: {sucursal_id, codigo_barras, lote}
        });
        if(!find) return null;
        //console.log('Producto encontrado: ', find.toJSON());
        return find;
    }

    async transferProductBulk(source_sucursal_id, productDataList) {
        const transaction = await this.model.sequelize.transaction();
        try {
            const transferResults = [];
            const tempExistencias = {};

            for (const product of productDataList) {
                try {
                    const { codigo_barras, lote, cantidad, motivo, target_sucursal_id } = product;

                    if (!target_sucursal_id || !codigo_barras || !lote || !cantidad) {
                        throw new Error('Faltan datos por producto para realizar la transferencia');
                    }

                    const key = `${codigo_barras}|${lote}`;
                    let originProduct;

                    if (!(key in tempExistencias)) {
                        originProduct = await this.findProductByInventory(
                            source_sucursal_id,
                            codigo_barras,
                            lote
                        );

                        if (!originProduct) {
                            throw new Error(`Producto con código ${codigo_barras} y lote ${lote} no encontrado en la sucursal ${source_sucursal_id}`);
                        }

                        tempExistencias[key] = originProduct.existencias;
                    }

                    if (tempExistencias[key] < cantidad) {
                        throw new Error(`Existencias insuficientes para el producto ${codigo_barras} en la sucursal ${source_sucursal_id}`);
                    }

                    // Descontar del inventario temporal y actualizar en DB
                    tempExistencias[key] -= cantidad;

                    // Si es la primera vez que se actualiza este producto, recupera el modelo
                    if (!originProduct) {
                        originProduct = await this.findProductByInventory(
                            source_sucursal_id,
                            codigo_barras,
                            lote
                        );
                    }

                    // 1. Descontar existencias del origen
                    await originProduct.update({
                        existencias: tempExistencias[key]
                    }, { transaction });

                    // 2. Registrar movimiento de salida
                    await this.movimientoRepo.createMovimiento({
                        producto_inventario_id: originProduct.producto_inventario_id,
                        tipo_movimiento_nombre: 'Salida',
                        cantidad,
                        referencia: `Lote: ${lote}`,
                        observaciones: `Reabastecimiento a inventario ${target_sucursal_id}`,
                        codigo_barras,
                        lote,
                        sucursal_id: source_sucursal_id
                    }, { transaction });

                    // 3. Buscar si ya existe el producto en el inventario destino
                    let targetProduct = await this.findProductByInventory(
                        target_sucursal_id,
                        codigo_barras,
                        lote
                    );

                    if (targetProduct) {
                        // Si ya existe, sumar existencias
                        await targetProduct.update({
                        existencias: targetProduct.existencias + cantidad
                        }, { transaction });
                    } else {
                        targetProduct = await this.createProductInInventory(
                        target_sucursal_id,
                        {
                            codigo_barras,
                            lote,
                            existencias: cantidad,
                            fecha_caducidad: originProduct.fecha_caducidad
                        },
                        { transaction, logMovimiento: false }
                        );
                    }

                    // 4. Movimiento en destino
                    await this.movimientoRepo.createMovimiento({
                        producto_inventario_id: targetProduct.producto_inventario_id,
                        tipo_movimiento_nombre: 'Entrada',
                        cantidad,
                        referencia: `Lote: ${lote}`,
                        observaciones: `Transferencia desde inventario ${source_sucursal_id}`,
                        codigo_barras,
                        lote,
                        sucursal_id: target_sucursal_id
                    }, { transaction });

                    transferResults.push({
                        codigo_barras,
                        lote,
                        cantidad_transferida: cantidad,
                        de: source_sucursal_id,
                        a: target_sucursal_id
                    });
                } catch (error) {
                    console.warn(`Producto omitido (${product.codigo_barras}): ${error.message}`);
                }
            }

            await transaction.commit();
            return {
            message: 'Transferencias múltiples completadas exitosamente',
            transferencias: transferResults
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Error en transferencia múltiple: ', error.message);
            throw error;
        }
    }
}