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
        const qty = Number(cantidad || 0);

        // 1) Tomar el registro correcto: activo y con stock
        const productoInventario = await this.productoInventarioModel.findOne({
            where: {
            sucursal_id,
            codigo_barras,
            lote,
            is_active: true,
            existencias: { [Op.gte]: qty },
            },
            order: [
            ['existencias', 'DESC'],
            ['fecha_ultima_actualizacion', 'DESC'],
            ['producto_inventario_id', 'DESC'],
            ],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!productoInventario) {
            const candidatos = await this.productoInventarioModel.findAll({
            where: { sucursal_id, codigo_barras, lote },
            attributes: ['producto_inventario_id', 'existencias', 'is_active', 'fecha_ultima_actualizacion'],
            order: [['producto_inventario_id', 'ASC']],
            transaction,
            });

            throw new Error(
            `No hay suficiente stock para el producto ${codigo_barras} en el lote ${lote}. ` +
            `Candidatos=${JSON.stringify(candidatos)}`
            );
        }

        // 2) Descontar
        await productoInventario.update(
            {
            existencias: productoInventario.existencias - qty,
            fecha_ultima_actualizacion: new Date(),
            is_active: (productoInventario.existencias - qty) > 0, // opcional
            },
            { transaction }
        );

        // 3) Movimiento
        await this.movimientoInventarioModel.create({
            producto_inventario_id: productoInventario.producto_inventario_id,
            tipo_movimiento_id: 5,
            cantidad: qty,
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

    _startOfDay(dateStr) {
        const [y, m, d] = String(dateStr).split('-').map(Number);
        return new Date(y, m - 1, d, 0, 0, 0, 0);
    }

    _startOfWeekMonday(dateObj) {
        const d = new Date(dateObj);
        const day = d.getDay();
        const diff = (day + 6) % 7;
        d.setDate(d.getDate() - diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    _addDays(dateObj, days) {
        const d = new Date(dateObj);
        d.setDate(d.getDate() + days);
        return d;
    }

    _getRange(fecha, tipo = 'dia') {
        const base = this._startOfDay(fecha);

        if (tipo === 'dia') {
            return { start: base, end: this._addDays(base, 1) };
        }

        if (tipo === 'semana') {
            const start = this._startOfWeekMonday(base);
            const end = this._addDays(start, 7);
            return { start, end };
        }

        if (tipo === 'mes') {
            const d = new Date(base);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            return { start, end };
        }

        return { start: base, end: this._addDays(base, 1) };
    }

    _getRangeCustom(fechaInicio, fechaFin) {
            const start = this._startOfDay(fechaInicio);
            const endIncl = this._startOfDay(fechaFin);
            const end = this._addDays(endIncl, 1); 
            return { start, end };
    }

    _normTurno(t) {
        const s = String(t || '').trim().toLowerCase();
        if (s === 'matutino') return 'Matutino';
        if (s === 'vespertino') return 'Vespertino';
        return null;
    }

    async getCorteCaja(sucursal_id, usuario_id, fecha, tipo = 'dia', opts = {}) {

        let range;
        if (opts.fecha_inicio && opts.fecha_fin) {
            range = this._getRangeCustom(opts.fecha_inicio, opts.fecha_fin);
        } else {
            range = this._getRange(fecha, tipo);
        }
        const { start, end } = range;
        console.log('Rango de fechas (semiabierto):', { start, end });

        const usuario = await Usuario.findByPk(Number(usuario_id), {
            attributes: ['usuario_id', 'nombre', 'apellido', 'turno', 'rol', 'sucursal_id']
        });

        if (!usuario) return { error: 'Usuario no encontrado' };
        if (!usuario.turno) return { error: 'El usuario no tiene turno asignado' };

        const turnoPropio = this._normTurno(usuario.turno);
        if (!turnoPropio) return { error: `Turno inválido: ${usuario.turno}` };

        const turnoContrario = turnoPropio === 'Matutino' ? 'Vespertino' : 'Matutino';

        // 1) Ventas del usuario
        const ventasUsuario = await this.ventaModel.findAll({
            where: {
            sucursal_id,
            usuario_id: Number(usuario_id),
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [
            { model: Usuario, attributes: ['usuario_id', 'nombre', 'apellido', 'turno', 'rol'] },
            { model: Sucursal, attributes: ['sucursal_id'] }
            ],
            order: [['fecha_venta', 'ASC']]
        });

        // 2) Total del usuario
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

        // 3) Total turno propio (trabajadores)
        const [totalTurnoRow] = await this.ventaModel.findAll({
            attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'total_turno']],
            include: [{
            model: Usuario,
            attributes: [],
            where: { turno: turnoPropio, rol: 'trabajador' }
            }],
            where: {
            sucursal_id,
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            raw: true
        });
        const total_turno_propio = Number(totalTurnoRow?.total_turno ?? 0);

        // 4) Total turno contrario (trabajadores)
        const [totalTurnoContrarioRow] = await this.ventaModel.findAll({
            attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'total_turno_contrario']],
            include: [{
            model: Usuario,
            attributes: [],
            where: { turno: turnoContrario, rol: 'trabajador' }
            }],
            where: {
            sucursal_id,
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            raw: true
        });
        const total_turno_contrario = Number(totalTurnoContrarioRow?.total_turno_contrario ?? 0);

        const total_otros_mismo_turno = Math.max(total_turno_propio - total_usuario, 0);

        // Ventas otros del mismo turno
        const ventasMismoTurnoOtros = await this.ventaModel.findAll({
            where: {
            sucursal_id,
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end },
            usuario_id: { [Op.ne]: Number(usuario_id) }
            },
            include: [
            {
                model: Usuario,
                attributes: ['usuario_id', 'nombre', 'apellido', 'turno', 'rol'],
                where: { turno: turnoPropio, rol: 'trabajador' }
            },
            { model: Sucursal, attributes: ['sucursal_id'] }
            ],
            order: [['fecha_venta', 'ASC']]
        });

        // agregados mismo turno
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
            include: [{
            model: Usuario,
            attributes: [],
            where: { turno: turnoPropio, rol: 'trabajador' }
            }],
            group: ['usuario_id', 'Usuario.turno'],
            raw: true
        });

        // Ventas administradores + total + agregados
        const ventasAdministradores = await this.ventaModel.findAll({
            where: {
            sucursal_id,
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [
            {
                model: Usuario,
                attributes: ['usuario_id', 'nombre', 'apellido', 'turno', 'rol'],
                where: { rol: 'administrador' }
            },
            { model: Sucursal, attributes: ['sucursal_id'] }
            ],
            order: [['fecha_venta', 'ASC']]
        });

        const [totalAdministradoresRow] = await this.ventaModel.findAll({
            attributes: [[fn('COALESCE', fn('SUM', col('total')), 0), 'total_administradores']],
            include: [{ model: Usuario, attributes: [], where: { rol: 'administrador' } }],
            where: {
            sucursal_id,
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            raw: true
        });
        const total_administradores = Number(totalAdministradoresRow?.total_administradores ?? 0);

        const agregadosAdministradoresRows = await this.ventaModel.findAll({
            attributes: [
            'usuario_id',
            [col('Usuario.nombre'), 'nombre'],
            [col('Usuario.apellido'), 'apellido'],
            [fn('COUNT', col('venta_id')), 'num_ventas'],
            [fn('SUM', col('total')), 'total_vendido']
            ],
            where: {
            sucursal_id,
            anulada: false,
            fecha_venta: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [{ model: Usuario, attributes: [], where: { rol: 'administrador' } }],
            group: ['usuario_id', 'Usuario.nombre', 'Usuario.apellido'],
            raw: true
        });

        return {
            sucursal_id,
            rango: {
            tipo: (opts.fecha_inicio && opts.fecha_fin) ? 'rango' : tipo,
            inicio: start,
            fin_exclusivo: end,
            fecha_inicio: opts.fecha_inicio || null,
            fecha_fin: opts.fecha_fin || null
            },
            usuario: {
            usuario_id: usuario.usuario_id,
            nombre: `${usuario.nombre}${usuario.apellido ? ' ' + usuario.apellido : ''}`.trim(),
            turno: turnoPropio,
            rol: usuario.rol
            },
            ventas_usuario: ventasUsuario,
            ventas_mismo_turno_otros: ventasMismoTurnoOtros,
            ventas_administradores: ventasAdministradores,
            agregados_mismo_turno_por_usuario: agregadosTurnoRows.map(r => ({
            usuario_id: r.usuario_id,
            turno: r.turno ?? 'sin_turno',
            num_ventas: Number(r.num_ventas),
            total_vendido: Number(r.total_vendido)
            })),
            agregados_administradores: agregadosAdministradoresRows.map(r => ({
            usuario_id: r.usuario_id,
            nombre: `${r.nombre}${r.apellido ? ' ' + r.apellido : ''}`.trim(),
            num_ventas: Number(r.num_ventas),
            total_vendido: Number(r.total_vendido)
            })),
            totales: {
            total_usuario,
            total_turno_propio,
            total_turno_contrario,
            total_otros_mismo_turno,
            total_administradores
            }
        };
    }

    async getCorteCajaSucursal(sucursal_id, fecha, tipo = 'dia', opts = {}) {
        let range;
        if (opts.fecha_inicio && opts.fecha_fin) {
            range = this._getRangeCustom(opts.fecha_inicio, opts.fecha_fin);
        } else {
            range = this._getRange(fecha, tipo);
        }
        const { start, end } = range;
        console.log('Rango de fechas (semiabierto):', { start, end });

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
            rango: {
            tipo: (opts.fecha_inicio && opts.fecha_fin) ? 'rango' : tipo,
            inicio: start,
            fin_exclusivo: end,
            fecha_inicio: opts.fecha_inicio || null,
            fecha_fin: opts.fecha_fin || null
            },
            totalGeneral,
            totalesPorTurno: totalesPorTurnoArr,
            totalesPorUsuario,
            ventas
        };
    }

    async cancelarVenta(venta_id) {
        const transaction = await this.ventaModel.sequelize.transaction();

        try {
            const venta = await this.ventaModel.findByPk(venta_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
            });

            if (!venta) throw new Error('Venta no encontrada');
            if (venta.anulada) throw new Error('La venta ya está anulada');

            const detalles = await this.detalleVentaModel.findAll({
            where: { venta_id },
            transaction,
            lock: transaction.LOCK.UPDATE,
            });

            if (!detalles || detalles.length === 0) {
            throw new Error('La venta no tiene detalles para reintegrar');
            }

            for (const d of detalles) {
            const qty = Number(d.cantidad);

            if (!Number.isFinite(qty) || qty <= 0) {
                throw new Error(
                `Cantidad inválida en detalle_venta_id=${d.detalle_venta_id ?? 'N/A'}: cantidad=${d.cantidad}`
                );
            }

            let productoInventario = null;

            if (d.producto_inventario_id) {
                productoInventario = await this.productoInventarioModel.findByPk(d.producto_inventario_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
                });
            }

            if (!productoInventario && d.lote) {
                productoInventario = await this.productoInventarioModel.findOne({
                where: {
                    sucursal_id: venta.sucursal_id,
                    codigo_barras: d.codigo_barras,
                    lote: d.lote,
                },
                order: [
                    ['producto_inventario_id', 'DESC'],
                ],
                transaction,
                lock: transaction.LOCK.UPDATE,
                });
            }

            if (!productoInventario) {
                productoInventario = await this.productoInventarioModel.findOne({
                where: {
                    sucursal_id: venta.sucursal_id,
                    codigo_barras: d.codigo_barras,
                },
                order: [
                    ['is_active', 'ASC'],                 
                    ['existencias', 'ASC'],               
                    ['fecha_ultima_actualizacion', 'DESC'],
                    ['producto_inventario_id', 'DESC'],
                ],
                transaction,
                lock: transaction.LOCK.UPDATE,
                });

                if (productoInventario && !d.lote) {
                }
            }

            if (!productoInventario) {
                throw new Error(
                `No se encontró producto_inventario para reintegrar: ` +
                `codigo=${d.codigo_barras} detalle_venta_id=${d.detalle_venta_id ?? 'N/A'} ` +
                `producto_inventario_id=${d.producto_inventario_id ?? 'null'} lote=${d.lote ?? 'null'}`
                );
            }

            await this.productoInventarioModel.update(
                {
                existencias: sequelize.literal(`existencias + ${qty}`),
                fecha_ultima_actualizacion: new Date(),
                is_active: true,
                },
                {
                where: { producto_inventario_id: productoInventario.producto_inventario_id },
                transaction,
                }
            );

            await this.movimientoInventarioModel.create(
                {
                producto_inventario_id: productoInventario.producto_inventario_id,
                tipo_movimiento_id: 6,
                cantidad: qty,
                referencia: `VENTA_CANCELADA_${venta_id}`,
                observaciones: `Reintegro por cancelación de venta (cb=${d.codigo_barras}${productoInventario.lote ? ` lote=${productoInventario.lote}` : ''})`,
                fecha_movimiento: new Date(),
                },
                { transaction }
            );
            }

            await this.ventaModel.update(
            { anulada: true },
            { where: { venta_id }, transaction }
            );

            await transaction.commit();
            return { success: true, venta_id, message: 'Venta cancelada y existencias reintegradas' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};