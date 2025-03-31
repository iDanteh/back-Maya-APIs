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
                    venta_id: nuevaVenta.venta_id
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
        return await this.ventaModel.findByPk(venta_id, {
            include: [{
                model: this.detalleVentaModel,
                as: 'detalles'
            }]
        });
    }

    async getVentasBySucursal(sucursal_id) {
        return await this.ventaModel.findAll({
            where: { sucursal_id },
            order: [['fecha_venta', 'DESC']]
        });
    }

    async anularVenta(venta_id) {
        const transaction = await this.ventaModel.sequelize.transaction();
    try {
        // 1. Obtener solo la venta (sin detalles)
        const venta = await this.ventaModel.findByPk(venta_id, { transaction });

        if (!venta) {
            throw new Error('Venta no encontrada');
        }

        if (venta.anulada) {
            throw new Error('La venta ya está anulada');
        }

        // 2. Simplemente marcar como anulada
        await venta.update({ 
            anulada: true,
        }, { transaction });

        await transaction.commit();
        return venta;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
    }
};

