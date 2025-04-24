import { Op, where } from 'sequelize';
import sequelize from '../database/conexion.js';

export class VentaRepository {
    constructor(ventaModel, detalleVentaModel, productoInventarioModel, inventarioModel, movimientoInventarioModel) {
        this.ventaModel = ventaModel;
        this.detalleVentaModel = detalleVentaModel;
        this.productoInventarioModel = productoInventarioModel;
        this.inventarioModel = inventarioModel;
        this.movimientoInventarioModel = movimientoInventarioModel;
    }

    async createVentaWithDetails(ventaData, detallesVenta) {
        const transaction = await this.ventaModel.sequelize.transaction();
        
        try {
            // 1. Crear la venta principal
            const nuevaVenta = await this.ventaModel.create(ventaData, { transaction });
            
            // 2. Procesar cada detalle de venta
            for (const detalle of detallesVenta) {
                if (!detalle.lote) {
                    throw new Error('Cada detalle de venta debe especificar un lote');
                }

                // Crear el detalle
                await this.detalleVentaModel.create({
                    ...detalle,
                    venta_id: nuevaVenta.venta_id,
                    usuario_id: ventaData.usuario_id,
                    sucursal_id: ventaData.sucursal_id
                }, { transaction });
                
                // Actualizar inventario específico por lote
                await this.actualizarInventarioPorLote(
                    ventaData.sucursal_id,
                    detalle.codigo_barras,
                    detalle.lote,
                    detalle.cantidad,
                    transaction
                );
            }
            
            await transaction.commit();
            return nuevaVenta;
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async actualizarInventarioPorLote(sucursal_id, codigo_barras, lote, cantidad, transaction) {
        // 1. Obtener el inventario de la sucursal
        const inventario = await this.inventarioModel.findOne({
            where: { sucursal_id },
            transaction
        });

        if (!inventario) {
            throw new Error(`No se encontró inventario para la sucursal ${sucursal_id}`);
        }

        // 2. Buscar el producto en el inventario específico por lote
        const productoInventario = await this.productoInventarioModel.findOne({
            where: { 
                codigo_barras,
                inventario_id: inventario.inventario_id,
                lote,
                existencias: {
                    [Op.gte]: cantidad
                }
            },
            transaction
        });

        if (!productoInventario) {
            throw new Error(`No hay suficiente stock para el producto ${codigo_barras} en el lote ${lote}`);
        }

        // 3. Actualizar existencias
        await this.productoInventarioModel.update({
            existencias: productoInventario.existencias - cantidad,
            fecha_ultima_actualizacion: new Date()
        }, {
            where: { 
                producto_inventario_id: productoInventario.producto_inventario_id 
            },
            transaction
        });

        // 4. Registra el movimiento del inventario
        await this.movimientoInventarioModel.create({
            producto_inventario_id: productoInventario.producto_inventario_id,
            tipo_movimiento_id: 5,
            cantidad,
            referencia: productoInventario.lote,
            observaciones: 'Venta de productos',
        }, { transaction });
    }

    async getVentaById(venta_id) {
        return await this.ventaModel.findByPk(venta_id);
    }

    async getVentasBySucursal(sucursal_id) {
        return await this.ventaModel.findAll({
            where: { sucursal_id }});
    }

    async anularVenta(venta_id) {
        const transaction = await this.ventaModel.sequelize.transaction();
        try {
            // 1. Obtener información básica de la venta
            const venta = await this.ventaModel.findByPk(venta_id, { transaction });
            
            if (!venta) {
                throw new Error('Venta no encontrada');
            }
            
            if (venta.anulada) {
                throw new Error('La venta ya está anulada');
            }
    
            // 2. Obtener los detalles de venta directamente (sin asociaciones)
            const detalles = await this.detalleVentaModel.findAll({
                where: { venta_id: venta_id },
                transaction
            });
    
            // 3. Reintegrar existencias por cada detalle
            for (const detalle of detalles) {
                // Obtener el inventario de la sucursal
                const inventario = await this.inventarioModel.findOne({
                    where: { sucursal_id: venta.sucursal_id },
                    transaction
                });
    
                if (!inventario) continue;
    
                // Buscar el producto en el inventario (con o sin lote)
                const whereClause = {
                    codigo_barras: detalle.codigo_barras,
                    inventario_id: inventario.inventario_id
                };
                
                if (detalle.lote) {
                    whereClause.lote = detalle.lote;
                }
    
                const productoInventario = await this.productoInventarioModel.findOne({
                    where: whereClause,
                    transaction
                });
    
                if (productoInventario) {
                    // Actualizar existencias (sumar la cantidad)
                    await this.productoInventarioModel.update({
                        existencias: sequelize.literal(`existencias + ${detalle.cantidad}`),
                        fecha_ultima_actualizacion: new Date()
                    }, {
                        where: { producto_inventario_id: productoInventario.producto_inventario_id },
                        transaction
                    });
    
                    // Registrar movimiento
                    await this.movimientoInventarioModel.create({
                        producto_inventario_id: productoInventario.producto_inventario_id,
                        tipo_movimiento_id: 6, // ID para anulación
                        cantidad: detalle.cantidad,
                        referencia: `VENTA_ANULADA_${venta_id}`,
                        observaciones: `Reintegro por anulación de venta`,
                        fecha_movimiento: new Date()
                    }, { transaction });
                }
            }
    
            // 4. Marcar la venta como anulada
            await this.ventaModel.update({
                anulada: true,
                fecha_anulacion: new Date()
            }, {
                where: { venta_id: venta_id },
                transaction
            });
    
            await transaction.commit();
            return { success: true, message: 'Venta anulada y existencias reintegradas' };
    
        } catch (error) {
            await transaction.rollback();
            console.error('Error en anularVenta:', error);
            throw new Error(`Error al anular la venta: ${error.message}`);
        }
    }

};

