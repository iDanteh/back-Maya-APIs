import { Op, Sequelize} from 'sequelize'
import Producto from '../models/Producto.Model.js';
import Categoria from '../models/Categoria.Model.js';
import Transferencia from '../models/Transferencia.Model.js';
import {
    aggregateInventoryProducts,
    buildInventoryLotWhere,
    isDuplicateInventoryError,
    normalizeInventoryProductData,
} from '../utils/Producto_InventarioRepository.utils.js';

// Extrae sólo YYYY-MM-DD de cualquier formato y retorna un literal MySQL
// que bypasea la conversión de timezone de Sequelize.
// Garantiza que SIEMPRE se almacene como 'YYYY-MM-DD 00:00:00' en la BD.
const toDateLiteral = (dateInput) => {
    if (!dateInput) return null;
    // Si ya es un Sequelize.literal, pasarlo directo
    if (typeof dateInput === 'object' && typeof dateInput.val === 'string') return dateInput;
    // Los modelos Sequelize retornan objetos Date — usar toISOString() para obtener 'YYYY-MM-DD'
    const str = dateInput instanceof Date ? dateInput.toISOString() : String(dateInput);
    const dateOnly = str.slice(0, 10); // 'YYYY-MM-DD'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
    return Sequelize.literal(`'${dateOnly} 00:00:00'`);
};

// Extrae sólo YYYY-MM-DD de cualquier formato para comparaciones con DATE()
const toDateOnly = (dateInput) => {
    if (!dateInput) return null;
    // Si ya es un Sequelize.literal, extraer la fecha de su valor interno
    if (typeof dateInput === 'object' && typeof dateInput.val === 'string') {
        return dateInput.val.replace(/'/g, '').slice(0, 10);
    }
    const str = dateInput instanceof Date ? dateInput.toISOString() : String(dateInput);
    return str.slice(0, 10); // 'YYYY-MM-DD'
};

const safeTransactionAction = async (transaction, action) => {
    if (!transaction || typeof transaction[action] !== 'function') return;
    await transaction[action]();
};

export class producto_inventarioRepository {
    constructor(model, movimientoRepo) {
        this.model = model;
        this.movimientoRepo = movimientoRepo;
    }

    async findAll() {
        return await this.model.findAll();
    }

    async findChangedSince(sucursal_id, since) {
        return this.model.findAll({
            where: {
                sucursal_id,
                // NULL en fecha_ultima_actualizacion significa que el registro nunca fue
                // actualizado por código (INSERT directo, migración sin el campo, etc.).
                // Se incluyen para que el cliente pueda evaluar su estado actual y, si
                // tienen existencias <= 0 o is_active = false, eliminarlos del caché.
                [Op.or]: [
                    { fecha_ultima_actualizacion: { [Op.gt]: since } },
                    { fecha_ultima_actualizacion: null },
                ],
            },
            include: [
                {
                    model: Producto,
                    attributes: { exclude: [] },
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto']
                        }
                    ]
                }
            ],
        });
    }

    // Nuevo método para buscar productos por sucursal_id
    // Actualización para obtener también la información de los productos
    async findByInventoryId(sucursal_id, { limit = 200, offset = 0, skipCount = false } = {}) {
        const where = { sucursal_id, is_active: true, existencias: { [Op.gt]: 0 } };
        const include = [
            {
                model: Producto,
                attributes: { exclude: [] },
                include: [
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto']
                    }
                ]
            }
        ];

        // Páginas 2..N: omitir COUNT — el total ya lo conoce el cliente desde página 1.
        // findAndCountAll emite dos queries (SELECT COUNT + SELECT data) en cada llamada;
        // para N-1 páginas eso son N-1 COUNTs innecesarios sobre la tabla completa.
        if (skipCount) {
            const rows = await this.model.findAll({ where, include, limit, offset });
            return { count: null, rows };
        }

        const { count, rows } = await this.model.findAndCountAll({
            where,
            include,
            limit,
            offset,
            distinct: true,
        });
        return { count, rows };
    }

    // Carga completa sin paginación. Seguro hasta ~8K filas por sucursal.
    // Por encima de ese umbral considerar cursor-based pagination.
    async findAllByInventoryId(sucursal_id) {
        return this.model.findAll({
            where: { sucursal_id, is_active: true, existencias: { [Op.gt]: 0 } },
            include: [
                {
                    model: Producto,
                    attributes: { exclude: [] },
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto']
                        }
                    ]
                }
            ],
            order: [['producto_inventario_id', 'ASC']],
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
            where: { sucursal_id, codigo_barras, is_active: true },
            include: [
                {
                    model: Producto,
                    attributes: { exclude: []},
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['categoria_id', 'nombre', 'descripcion', 'descuento', 'dia_descuento', 'impuesto',]
                        }
                    ]
                }
            ]
        });
    }

    async createProductInInventory(sucursal_id, productData, options = {}) {
        const { transaction, logMovimiento = true } = options;
        const normalizedProduct = normalizeInventoryProductData({ ...productData, sucursal_id });

        const existingLot = await this.model.findOne({
            where: buildInventoryLotWhere(sucursal_id, normalizedProduct),
            transaction
        });

        let result;
        if (existingLot) {
            const incomingQuantity = Number(normalizedProduct.existencias || 0);
            result = await existingLot.update({
                existencias: Number(existingLot.existencias || 0) + incomingQuantity,
                is_active: true,
                fecha_ultima_actualizacion: new Date()
            }, { transaction });

            if (logMovimiento) {
                await this.movimientoRepo.createMovimiento({
                    producto_inventario_id: existingLot.producto_inventario_id,
                    tipo_movimiento_nombre: 'Entrada',
                    cantidad: incomingQuantity,
                    referencia: `Lote: ${existingLot.lote}`,
                    observaciones: 'Reabastecimiento de inventario',
                    codigo_barras: existingLot.codigo_barras,
                    lote: existingLot.lote,
                    sucursal_id
                }, { transaction });
            }

        } else {
            result = await this.model.create({
                ...normalizedProduct,
                sucursal_id,
                is_active: true,
                fecha_caducidad: toDateLiteral(normalizedProduct.fecha_caducidad),
                fecha_ultima_actualizacion: new Date()
            }, { transaction });

            if (logMovimiento) {
                await this.movimientoRepo.createMovimiento({
                    producto_inventario_id: result.producto_inventario_id,
                    tipo_movimiento_nombre: 'Entrada',
                    cantidad: Number(normalizedProduct.existencias || 0),
                    referencia: `Lote: ${normalizedProduct.lote}`,
                    observaciones: 'Nuevo lote ingresado',
                    codigo_barras: normalizedProduct.codigo_barras,
                    lote: normalizedProduct.lote,
                    sucursal_id
                }, { transaction });
            }
        }
        return result;
    }

    async bulkCreateProductsInInventory(sucursal_id, productsData) {
        const transaction = await this.model.sequelize.transaction();
        try {
            const normalizedProducts = aggregateInventoryProducts(productsData.map(product => ({ ...product, sucursal_id })));
            const existingProducts = await this.model.findAll({
                where: {
                    [Op.or]: normalizedProducts.map(product => buildInventoryLotWhere(sucursal_id, product))
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const existingMap = new Map(existingProducts.map(product => [
                `${String(product.codigo_barras || '')}||${String(product.lote || '')}||${toDateOnly(product.fecha_caducidad)}`,
                product
            ]));

            const updates = [];
            const newEntries = [];
            // Detalle por producto afectado, para la bitácora de auditoría (Sesión 2):
            // updated/inserted son solo conteos, no alcanzan para saber QUÉ lote se tocó.
            const afectados = [];

            for (const product of normalizedProducts) {
                const normalizedProduct = normalizeInventoryProductData(product);
                const existingProduct = existingMap.get(
                    `${String(normalizedProduct.codigo_barras || '')}||${String(normalizedProduct.lote || '')}||${toDateOnly(normalizedProduct.fecha_caducidad)}`
                );

                if (existingProduct) {
                    const wasInactive = !existingProduct.is_active;
                    const incomingQuantity = Number(normalizedProduct.existencias || 0);
                    existingProduct.existencias = Number(existingProduct.existencias || 0) + incomingQuantity;
                    existingProduct.is_active = true;
                    existingProduct.fecha_ultima_actualizacion = new Date();
                    updates.push(existingProduct);

                    await this.movimientoRepo.createMovimiento({
                        producto_inventario_id: existingProduct.producto_inventario_id,
                        tipo_movimiento_nombre: 'Entrada',
                        cantidad: incomingQuantity,
                        referencia: `Lote: ${existingProduct.lote}`,
                        observaciones: wasInactive
                            ? 'Abastecimiento del inventario (lote reactivado)'
                            : 'Abastecimiento del inventario',
                        codigo_barras: existingProduct.codigo_barras,
                        lote: existingProduct.lote,
                        sucursal_id
                    }, { transaction });

                    afectados.push({
                        producto_inventario_id: existingProduct.producto_inventario_id,
                        codigo_barras: existingProduct.codigo_barras,
                        lote: existingProduct.lote,
                        cantidad_agregada: incomingQuantity,
                        existencias_resultantes: existingProduct.existencias,
                        accion: 'ACTUALIZADO',
                    });
                } else {
                    newEntries.push({
                        ...normalizedProduct,
                        sucursal_id,
                        is_active: true,
                        fecha_caducidad: toDateLiteral(normalizedProduct.fecha_caducidad),
                        fecha_ultima_actualizacion: new Date(),
                    });
                }
            }

            if (updates.length > 0) {
                await Promise.all(updates.map(product => product.save({ transaction })));
            }

            for (const newProduct of newEntries) {
                const createdProduct = await this.model.create(newProduct, { transaction });

                await this.movimientoRepo.createMovimiento({
                    producto_inventario_id: createdProduct.producto_inventario_id,
                    tipo_movimiento_nombre: 'Entrada',
                    cantidad: Number(newProduct.existencias || 0),
                    referencia: `Lote: ${newProduct.lote}`,
                    observaciones: 'Nuevo lote ingresado',
                    codigo_barras: newProduct.codigo_barras,
                    lote: newProduct.lote,
                    sucursal_id
                }, { transaction });

                afectados.push({
                    producto_inventario_id: createdProduct.producto_inventario_id,
                    codigo_barras: createdProduct.codigo_barras,
                    lote: createdProduct.lote,
                    cantidad_agregada: Number(newProduct.existencias || 0),
                    existencias_resultantes: createdProduct.existencias,
                    accion: 'CREADO',
                });
            }

            await transaction.commit();
            return { updated: updates.length, inserted: newEntries.length, afectados };

        } catch (error) {
            await transaction.rollback();
            if (isDuplicateInventoryError(error)) {
                throw new Error('Ya existe un registro activo con ese código de barras, lote y fecha de caducidad en esta sucursal.');
            }
            throw error;
        }
    }
    // Método para eliminar un lote de un producto en un inventario
    async deleteLot(sucursal_id, codigo_barras, lote) {
        const loteNorm = String(lote ?? "").trim();

        const lot = await this.model.findOne({
            where: { sucursal_id, codigo_barras, lote: loteNorm }
        });

        if (!lot) return { ok: false, reason: "NOT_FOUND" };

        if (lot.is_active === false) return { ok: true, alreadyInactive: true, lot };

        if (Number(lot.existencias || 0) > 0) return { ok: false, reason: "HAS_STOCK" };

        lot.is_active = false;
        lot.fecha_ultima_actualizacion = new Date();
        await lot.save();

        return { ok: true, deactivated: true, lot };
        }

    async update(producto_inventario_id, productData) {
        const transaction = await this.model.sequelize.transaction();
        try {
            const product = await this.model.findByPk(producto_inventario_id);
            if (!product) {
            await safeTransactionAction(transaction, 'rollback');
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

            if ('existencias' in productData) {
                productData.existencias = Number(productData.existencias || 0);
                productData.is_active = productData.existencias > 0;
            }

            if (productData.fecha_caducidad != null) {
                productData.fecha_caducidad = toDateLiteral(productData.fecha_caducidad);
            }
            const updated = await product.update({ ...productData, fecha_ultima_actualizacion: new Date() }, { transaction });

            await safeTransactionAction(transaction, 'commit');
            return updated;
        } catch (err) {
            await safeTransactionAction(transaction, 'rollback');
            throw err;
        }
    }


    async findProductByInventory(sucursal_id, codigo_barras, lote, fecha_caducidad, options = {}) {
        const { transaction, lock } = options;
        const queryOptions = {
            where: {
                sucursal_id,
                codigo_barras,
                lote,
                [Op.and]: [
                    Sequelize.where(
                        Sequelize.fn('DATE', Sequelize.col('fecha_caducidad')),
                        '=',
                        toDateOnly(fecha_caducidad)
                    )
                ]
            }
        };
        if (transaction) {
            queryOptions.transaction = transaction;
            // lock: transaction.LOCK.UPDATE → SELECT FOR UPDATE, previene race conditions
            // en transferencias concurrentes que lean el mismo registro de stock.
            if (lock) queryOptions.lock = lock;
        }
        return await this.model.findOne(queryOptions) ?? null;
    }

    async transferProductBulk(source_sucursal_id, productDataList, usuario_id) {
        // Calculado antes de la transacción: si algo falla a mitad de camino, el
        // rollback se lleva puesto cualquier Transferencia creada dentro de ella,
        // así que para dejar rastro del intento fallido hace falta saber de antemano
        // a qué destinos se quiso transferir.
        const destinosIntentados = [...new Set(productDataList.map(p => p.target_sucursal_id).filter(Boolean))];
        const transaction = await this.model.sequelize.transaction();
        try {
            const transferResults = [];
            const tempExistencias = {};
            // Un mismo request puede transferir a varias sucursales destino a la vez
            // (se elige destino por producto en el frontend). Cada par (origen, destino)
            // es una transferencia distinta — se crea una sola vez y se reutiliza su
            // transferencia_id para correlacionar todos los movimientos de ese grupo.
            const transferenciaPorDestino = {};

            const getOrCreateTransferencia = async (target_sucursal_id) => {
                if (!transferenciaPorDestino[target_sucursal_id]) {
                    const transferencia = await Transferencia.create({
                        usuario_id,
                        sucursal_origen_id: source_sucursal_id,
                        sucursal_destino_id: target_sucursal_id,
                        estado: 'EXITOSA',
                    }, { transaction });
                    transferenciaPorDestino[target_sucursal_id] = transferencia.transferencia_id;
                }
                return transferenciaPorDestino[target_sucursal_id];
            };

            for (const product of productDataList) {
                const { codigo_barras, lote, fecha_caducidad, cantidad, motivo, target_sucursal_id } = product;

                if (!target_sucursal_id || !codigo_barras || !lote || !cantidad) {
                    throw new Error('Faltan datos por producto para realizar la transferencia');
                }

                const transferencia_id = await getOrCreateTransferencia(target_sucursal_id);

                const key = `${codigo_barras}|${lote}|${fecha_caducidad}`;
                let originProduct;

                if (!(key in tempExistencias)) {
                    originProduct = await this.findProductByInventory(
                        source_sucursal_id,
                        codigo_barras,
                        lote,
                        fecha_caducidad,
                        { transaction, lock: transaction.LOCK.UPDATE }
                    );

                    if (!originProduct) {
                        throw new Error(`Producto con código ${codigo_barras} y lote ${lote} no encontrado en la sucursal ${source_sucursal_id}`);
                    }

                    tempExistencias[key] = originProduct.existencias;
                }

                if (tempExistencias[key] < cantidad) {
                    throw new Error(`Existencias insuficientes para el producto ${codigo_barras} en la sucursal ${source_sucursal_id}`);
                }

                tempExistencias[key] -= cantidad;

                if (!originProduct) {
                    originProduct = await this.findProductByInventory(
                        source_sucursal_id,
                        codigo_barras,
                        lote,
                        fecha_caducidad,
                        { transaction, lock: transaction.LOCK.UPDATE }
                    );
                }

                // 1. Descontar existencias del origen
                const nuevoStock = tempExistencias[key];

                await originProduct.update({
                    existencias: nuevoStock,
                    is_active: nuevoStock > 0,
                    fecha_ultima_actualizacion: new Date()
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
                    sucursal_id: source_sucursal_id,
                    transferencia_id
                }, { transaction });

                // 3. Buscar si ya existe el producto en el inventario destino
                let targetProduct = await this.findProductByInventory(
                    target_sucursal_id,
                    codigo_barras,
                    lote,
                    fecha_caducidad,
                    { transaction, lock: transaction.LOCK.UPDATE }
                );

                if (targetProduct) {
                    await targetProduct.update({
                        existencias: targetProduct.existencias + cantidad,
                        is_active: true,
                        fecha_ultima_actualizacion: new Date()
                    }, { transaction });
                } else {
                    targetProduct = await this.createProductInInventory(
                        target_sucursal_id,
                        {
                            codigo_barras,
                            lote,
                            existencias: cantidad,
                            fecha_caducidad: toDateLiteral(originProduct.fecha_caducidad),
                            is_active: true
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
                    sucursal_id: target_sucursal_id,
                    transferencia_id
                }, { transaction });

                transferResults.push({
                    codigo_barras,
                    lote,
                    cantidad_transferida: cantidad,
                    de: source_sucursal_id,
                    a: target_sucursal_id
                });
            }

            await transaction.commit();
            return {
            message: 'Transferencias múltiples completadas exitosamente',
            transferencias: transferResults
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Error en transferencia múltiple: ', error.message);

            // Fuera de la transacción ya revertida, a propósito: así el registro
            // del intento fallido sobrevive aunque el inventario no se haya movido.
            if (usuario_id && destinosIntentados.length > 0) {
                try {
                    await Promise.all(destinosIntentados.map(target_sucursal_id => Transferencia.create({
                        usuario_id,
                        sucursal_origen_id: source_sucursal_id,
                        sucursal_destino_id: target_sucursal_id,
                        estado: 'ERROR',
                        error_mensaje: String(error.message ?? 'Error desconocido').slice(0, 255),
                    })));
                } catch (logError) {
                    console.error('No se pudo persistir el registro de transferencia fallida: ', logError.message);
                }
            }

            throw error;
        }
    }

    async findProductosCaducados(sucursal_id) {
        return await this.model.findAll({
            where: {
                sucursal_id,
                fecha_caducidad: {
                    [Op.lt]: Sequelize.fn("CURDATE")
                },
                [Op.or]: [
                    { existencias: { [Op.gt]: 0 } },
                    { is_active: true }
                ]
            },
            include: [
                {
                    model: Producto,
                    attributes: [
                        'codigo_barras',
                        'descripcion'
                    ]
                }
            ],
            order: [
                ['fecha_caducidad', 'ASC']
            ]
        });
    }

    //Nueva método para actualizar las existencias y el estado de los productos caducados
    async desactivarProductosCaducados(sucursal_id) {
        const transaction = await this.model.sequelize.transaction();

        try {
            const productosCaducados = await this.model.findAll({
                where: {
                    sucursal_id,
                    fecha_caducidad: {
                        [Op.lt]: Sequelize.fn("CURDATE")
                    },
                    [Op.or]: [
                        { existencias: { [Op.gt]: 0 } },
                        { is_active: true }
                    ]
                },
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            for (const producto of productosCaducados) {

                //Registrar movimiento únicamente si todavía tenía existencias
                if (producto.existencias > 0) {
                    await this.movimientoRepo.createMovimiento({
                        producto_inventario_id: producto.producto_inventario_id,
                        tipo_movimiento_nombre: "Caducidad",
                        cantidad: producto.existencias,
                        referencia: `Lote: ${producto.lote}`,
                        observaciones: "Producto desactivado automáticamente por fecha de caducidad.",
                        codigo_barras: producto.codigo_barras,
                        lote: producto.lote,
                        sucursal_id: producto.sucursal_id
                    }, { transaction });
                }

                await producto.update({
                    existencias: 0,
                    is_active: false,
                    fecha_ultima_actualizacion: new Date()
                }, { transaction });
            }

            await transaction.commit();

            return {
                total: productosCaducados.length
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}