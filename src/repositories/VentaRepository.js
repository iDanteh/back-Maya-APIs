import { Op, STRING, where, fn, col, literal } from 'sequelize';
import sequelize from '../database/conexion.js';
import Usuario from '../models/Usuario.Model.js';
import dayjs from 'dayjs';
import Sucursal from '../models/Sucursal.Model.js';
import Venta from '../models/Venta.Model.js';

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
        // 1. Buscar el producto en el inventario específico por sucursal, lote y código
        const productoInventario = await this.productoInventarioModel.findOne({
            where: { 
                sucursal_id,
                codigo_barras,
                lote
            },
            transaction
        });

        if (!productoInventario) {
            throw new Error(`No se encontró el producto ${codigo_barras} en el lote ${lote} para la sucursal ${sucursal_id}`);
        }

        // 2. Validar existencias suficientes
        if (productoInventario.existencias < cantidad) {
            throw new Error(`No hay suficiente stock para el producto ${codigo_barras} en el lote ${lote}`);
        }

        // 3. Actualizar existencias
        productoInventario.existencias -= cantidad;
        productoInventario.fecha_ultima_actualizacion = new Date();
        await productoInventario.save({ transaction });

        // 4. Registrar el movimiento del inventario
        await this.movimientoInventarioModel.create({
            producto_inventario_id: productoInventario.producto_inventario_id,
            tipo_movimiento_id: 5,
            cantidad,
            referencia: productoInventario.lote,
            observaciones: 'Venta de productos',
        }, { transaction });
    }

    async getVentaById(venta_id) {
        return await this.ventaModel.findAll({
            where: { venta_id },
            include: [{
                model: Usuario,
                attributes: {
                    exclude: [
                        'telefono', 'email', 'rol', 'fecha_ingreso', 'usuario', 'clave_acceso'
                    ]
                }
            }]
        });
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

    async getCorteCaja(sucursal_id, usuario_id, fecha, tipo = 'dia') {
        const parsedDate = dayjs(fecha, 'YYYY-MM-DD');

        let start, end;

        if (tipo === 'semana') {
            start = parsedDate.startOf('week').toDate();
            end = parsedDate.endOf('week').toDate();
        } else if (tipo === 'mes') {
            start = parsedDate.startOf('month').toDate();
            end = parsedDate.endOf('month').toDate();
        } else {
            start = parsedDate.startOf('day').toDate();
            end = parsedDate.endOf('day').toDate();
        }

        console.log('🕒 Rango de fechas:', { start, end });

        const usuario = await Usuario.findByPk(Number(usuario_id), {
            attributes: ['usuario_id', 'nombre', 'apellido', 'turno', 'sucursal_id']
        });

        if (!usuario) {
            return { error: 'Usuario no encontrado' };
        }

        const ventasUsuario = await this.ventaModel.findAll({
            where: {
                usuario_id: Number(usuario_id),
                sucursal_id,
                fecha_venta: { [Op.between]: [start, end] },
                anulada: false
            }, 
            include: [
                {
                    model: Usuario,
                    attributes: { 
                        exclude: [
                            'telefono', 'email', 'rol', 'fecha_ingreso', 'usuario', 'clave_acceso'
                        ]
                    }
                }
            ]
        });

        const [totalUsuarioRow] = await this.ventaModel.findAll({
            attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_usuario']],
            where: {
                usuario_id: Number(usuario_id),
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.between]: [start, end] }
            },
            raw: true
        });

        const total_usuario = Number(totalUsuarioRow.total_usuario);

        const [totalTurnoRow] = await this.ventaModel.findAll({
            attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_turno']],
            include: [
                {
                    model: Usuario,
                    attributes: [],
                    where: { turno: usuario.turno }
                }
            ],
            where: {
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.between]: [start, end] }
            },
            raw: true
        });

        const total_turno = Number(totalTurnoRow.total_turno);

        return {
            rango: { start, end },
            usuario: {
                usuario_id: usuario.usuario_id,
                nombre: `${usuario.nombre}${usuario.apellido ? ' ' + usuario.apellido : ''}`.trim(),
                turno: usuario.turno,
            },
            detalle_ventas: ventasUsuario,
            totales: {
                total_usuario,
                total_turno,
            }
        };
    }

    _getRange(fecha, tipo = 'dia') {
        const d = dayjs(fecha, 'YYYY-MM-DD');
        if (tipo === 'semana') {
            const start = d.startOf('week');
            return { start: start.toDate(), end: start.add(1, 'week').toDate() };
        }
        if (tipo === 'mes') {
            const start = d.startOf('month');
            return { start: start.toDate(), end: start.add(1, 'month').toDate() };
        }
        const start = d.startOf('day');
        return { start: start.toDate(), end: start.add(1, 'day').toDate() };
    }

    async getCorteCaja(sucursal_id, usuario_id, fecha, tipo = 'dia') {
        const { start, end } = this._getRange(fecha, tipo);
        console.log('🕒 Rango de fechas (semiabierto):', { start, end });

        const usuario = await Usuario.findByPk(Number(usuario_id), {
            attributes: ['usuario_id', 'nombre', 'apellido', 'turno', 'sucursal_id']
        });

        if (!usuario) {
            return { error: 'Usuario no encontrado' };
        }

        // 1) Ventas del usuario en la sucursal y rango
        const ventasUsuario = await this.ventaModel.findAll({
            where: {
                sucursal_id,
                usuario_id: Number(usuario_id),
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [
                { model: Usuario, attributes: ['usuario_id', 'nombre', 'apellido', 'turno'] },
                { model: Sucursal, attributes: ['sucursal_id'] }
            ],
            order: [['fecha_venta', 'ASC']]
        });

        // Totales del propio usuario
        const [totalUsuarioRow] = await this.ventaModel.findAll({
            attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'total_usuario']],
            where: {
                sucursal_id,
                usuario_id: Number(usuario_id),
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            raw: true
        });
        const total_usuario = Number(totalUsuarioRow?.total_usuario ?? 0);

        const [totalTurnoRow] = await this.ventaModel.findAll({
            attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'total_turno']],
            include: [{ model: Usuario, attributes: [], where: { turno: usuario.turno } }],
            where: {
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            raw: true
        });
        const total_turno = Number(totalTurnoRow?.total_turno ?? 0);
        const total_otros_mismo_turno = Math.max(total_turno - total_usuario, 0);

        const ventasMismoTurnoOtros = await this.ventaModel.findAll({
            where: {
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end },
                usuario_id: { [Op.ne]: Number(usuario_id) }
            },
            include: [
                { model: Usuario, attributes: ['usuario_id', 'nombre', 'apellido', 'turno'], where: { turno: usuario.turno } },
                { model: Sucursal, attributes: ['sucursal_id'] }
            ],
            order: [['fecha_venta', 'ASC']]
        });

        const agregadosTurnoRows = await this.ventaModel.findAll({
            attributes: [
                'usuario_id',
                [col('Usuario.turno'), 'turno'],
                [fn('COUNT', col('venta_id')), 'num_ventas'],
                [fn('SUM', col('total')), 'total_vendido']
            ],
            where: {
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [{ model: Usuario, attributes: [], where: { turno: usuario.turno } }],
            group: ['usuario_id', 'Usuario.turno'],
            raw: true
        });

        return {
            sucursal_id,
            rango: { tipo, inicio: start, fin_exclusivo: end },
            usuario: {
                usuario_id: usuario.usuario_id,
                nombre: `${usuario.nombre}${usuario.apellido ? ' ' + usuario.apellido : ''}`.trim(),
                turno: usuario.turno
            },
            ventas_usuario: ventasUsuario, 
            ventas_mismo_turno_otros: ventasMismoTurnoOtros, 
            agregados_mismo_turno_por_usuario: agregadosTurnoRows.map(r => ({
                usuario_id: r.usuario_id,
                turno: r.turno ?? 'sin_turno',
                num_ventas: Number(r.num_ventas),
                total_vendido: Number(r.total_vendido)
            })), 
            totales: {
                total_usuario,
                total_turno,
                total_otros_mismo_turno
            }
        };
    }

    async getCorteCajaSucursal(sucursal_id, fecha, tipo = 'dia') {
        const { start, end } = this._getRange(fecha, tipo);
        console.log('🕒 Rango de fechas (semiabierto):', { start, end });

        const ventas = await this.ventaModel.findAll({
            where: {
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [
                { model: Usuario, attributes: ['usuario_id', 'nombre', 'apellido', 'turno'] },
                { model: Sucursal, attributes: ['sucursal_id'] }
            ],
            order: [['fecha_venta', 'ASC']]
        });

        const totalesPorUsuarioRows = await this.ventaModel.findAll({
            attributes: [
                'usuario_id',
                [col('Usuario.turno'), 'turno'],
                [fn('SUM', col('total')), 'total_vendido'],
                [fn('COUNT', col('venta_id')), 'num_ventas']
            ],
            where: {
                sucursal_id,
                anulada: false,
                fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [{ model: Usuario, attributes: [] }],
            group: ['usuario_id', 'Usuario.turno'],
            raw: true
        });

        const totalesPorUsuario = totalesPorUsuarioRows.map(r => ({
            usuario_id: r.usuario_id,
            turno: r.turno ?? 'sin_turno',
            num_ventas: Number(r.num_ventas),
            total_vendido: Number(r.total_vendido)
        }));

        const totalesPorTurno = totalesPorUsuario.reduce((acc, r) => {
            const t = r.turno || 'sin_turno';
            acc[t] = acc[t] || { turno: t, num_ventas: 0, total_vendido: 0 };
            acc[t].num_ventas += r.num_ventas;
            acc[t].total_vendido += r.total_vendido;
            return acc;
        }, {});
        const totalesPorTurnoArr = Object.values(totalesPorTurno).map(r => ({
            turno: r.turno,
            num_ventas: Number(r.num_ventas),
            total_vendido: Number(r.total_vendido)
        }));

        const totalGeneral = totalesPorUsuario.reduce((s, r) => s + r.total_vendido, 0);

        return {
            sucursal_id,
            rango: { tipo, inicio: start, fin_exclusivo: end },
            totalGeneral,
            totalesPorTurno: totalesPorTurnoArr,
            totalesPorUsuario,
            ventas
        };
    }
};