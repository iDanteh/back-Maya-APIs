import { Op } from 'sequelize';
import Venta from '../models/Venta.Model.js';
import Detalle_Venta from '../models/Detalle_Venta.Model.js';
import Producto_Inventario from '../models/Producto_Inventario.Model.js';
import Inventario from '../models/Inventario.Model.js'
import { VentaRepository } from '../repositories/VentaRepository.js';
import MovimientoInventario from '../models/Movimiento_Inventario.Model.js';
import Producto from '../models/Producto.Model.js';
import { getPagination } from '../utils/pagination.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const ventaRepository = new VentaRepository(Venta, Detalle_Venta, Producto_Inventario, Inventario, MovimientoInventario);

function buildVentaIdClientStyle(sucursal_id, fecha = new Date()) {
    const suc = String(sucursal_id).slice(0, 3).toUpperCase();
    const pad2 = (n) => String(n).padStart(2, "0");
    const yy = String(fecha.getFullYear()).slice(-2);
    const MM = pad2(fecha.getMonth() + 1);
    const dd = pad2(fecha.getDate());
    const HH = pad2(fecha.getHours());
    const mm = pad2(fecha.getMinutes());
    const ss = pad2(fecha.getSeconds());
    const ts = `${yy}${MM}${dd}${HH}${mm}${ss}`;
    const rnd = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    return `V${suc}${ts}${rnd}`;
}

export const createVenta = async (req, res) => {
    try {
        const {
        venta_id,
        numero_factura,
        fecha_venta,
        sucursal_id,
        usuario_id,
        total,
        total_recibido,
        detalles,
        } = req.body;

        if (!venta_id || !numero_factura) {
        return res.status(400).json({
            error: "Faltan IDs generados por el cliente",
            details: "Se requiere venta_id y numero_factura",
        });
        }

        if (!fecha_venta) {
        return res.status(400).json({
            error: "Falta fecha_venta generada por el cliente",
        });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: "Debe especificar al menos un producto con lote" });
        }

        if (detalles.some(d => !d.lote)) {
        return res.status(400).json({ error: "Todos los productos deben especificar un lote" });
        }

        const totalNum = Number(total);
        const totalRecibidoNum = Number(total_recibido ?? total);

        if (!Number.isFinite(totalNum) || totalNum <= 0) {
        return res.status(400).json({ error: "El total de la venta debe ser un número positivo" });
        }

        if (!Number.isFinite(totalRecibidoNum) || totalRecibidoNum < totalNum) {
        return res.status(400).json({ error: "El dinero recibido no puede ser menor al total de la venta" });
        }

        const ventaData = {
        venta_id,
        numero_factura,
        fecha_venta: new Date(fecha_venta),
        sucursal_id,
        usuario_id,
        total: totalNum,
        total_recibido: totalRecibidoNum,
        };

        const nuevaVenta = await ventaRepository.createVentaWithDetails(ventaData, detalles);

        return res.status(201).json({
        message: "Venta registrada exitosamente",
        venta: nuevaVenta,
        });

    } catch (error) {
        const statusCode =
        (error.message.includes("No hay suficiente stock") || error.message.includes("no encontrado"))
            ? 400
            : 500;

        res.status(statusCode).json({ error: "Error al registrar la venta", details: error.message });
        console.error('createVenta error:', error);
        console.error('sql:', error?.sql);
        console.error('original:', error?.original);
    }
};

export const getVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;
        const venta = await ventaRepository.getVentaById(venta_id);
        
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        
        res.json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVentasBySucursal = async (req, res) => {
    try {
        const { sucursal_id } = req.params;
        const { limit, offset } = getPagination(req.query);
        const ventas = await ventaRepository.getVentasBySucursal(sucursal_id, { limit, offset });

        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVentasByFecha = async (req, res) => {
    try {
        const { sucursal_id, fecha_inicio, fecha_fin } = req.query;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
        }

        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);

        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({ error: 'Las fechas proporcionadas no son válidas' });
        }

        const whereClause = {
            fecha_venta: {
                [Op.between]: [inicio, fin]
            }
        };
        
        if (sucursal_id) {
            whereClause.sucursal_id = sucursal_id;
        }
        
        const { limit, offset, page } = getPagination(req.query);

        const { count, rows: ventas } = await Venta.findAndCountAll({
            where: whereClause,
            include: [{
                model: Detalle_Venta,
                as: 'detalles'
            }],
            order: [['fecha_venta', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        res.json({
            data: ventas,
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVentasPorUsuarioYFecha = async (req, res) => {
    const { sucursal_id, usuario_id, fecha, tipo = 'dia' } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!usuario_id || !sucursal_id) {
        return res.status(400).json({ message: 'Faltan parámetros sucursal_id o usuario_id' });
    }

    const isRango = Boolean(fecha_inicio && fecha_fin);
    if (!isRango && !fecha) {
        return res.status(400).json({ message: 'Falta parámetro fecha' });
    }

    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 500, 1), 2000);
        const offset = (page - 1) * limit;

        const data = await ventaRepository.getCorteCaja(
        sucursal_id,
        usuario_id,
        fecha || fecha_inicio,
        tipo,
        isRango ? { fecha_inicio, fecha_fin } : {},
        { limit, offset, page }
        );

        if (!data) return res.status(404).json({ message: 'No encontrado' });
        if (data.error) return res.status(400).json(data);

        const nUsuario = Array.isArray(data.ventas_usuario) ? data.ventas_usuario.length : 0;
        const nAdmin = Array.isArray(data.ventas_administradores) ? data.ventas_administradores.length : 0;

        if (nUsuario === 0 && nAdmin === 0) {
        return res.status(404).json({ message: 'No se encontraron ventas en el rango' });
        }

        return res.json(data);
    } catch (error) {
        console.error('Error al obtener corte', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
    };

    export const getVentasPorSucursalYFecha = async (req, res) => {
    const { sucursal_id, fecha, tipo = 'dia' } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!sucursal_id) {
        return res.status(400).json({ message: 'Falta parámetro sucursal_id' });
    }

    const isRango = Boolean(fecha_inicio && fecha_fin);
    if (!isRango && !fecha) {
        return res.status(400).json({ message: 'Falta parámetro fecha' });
    }

    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 500, 1), 2000);
        const offset = (page - 1) * limit;

        const data = await ventaRepository.getCorteCajaSucursal(
        sucursal_id,
        fecha || fecha_inicio,
        tipo,
        isRango ? { fecha_inicio, fecha_fin } : {},
        { limit, offset, page }
        );

        if (!data) return res.status(404).json({ message: 'No encontrado' });

        const nVentas = Array.isArray(data.ventas) ? data.ventas.length : 0;
        if (nVentas === 0) {
        return res.status(404).json({ message: 'No se encontraron ventas en el rango' });
        }

        return res.status(200).json(data);
    } catch (error) {
    console.error('Error al obtener corte sucursal', {
        message: error?.message,
        name: error?.name,
        parent: error?.parent?.message,
        sql: error?.sql,
    });
    return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const cancelarVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;

        if (!venta_id) {
        return res.status(400).json({ error: 'Se requiere venta_id' });
        }

        const resultado = await ventaRepository.cancelarVenta(venta_id);

        return res.status(200).json({
        success: true,
        message: 'Venta cancelada exitosamente',
        data: resultado,
        });
    } catch (error) {
        const msg = error?.message || 'Error interno';

        const status =
        msg.includes('no encontrada') ? 404 :
        msg.includes('ya está anulada') ? 400 :
        msg.includes('no tiene detalles') ? 400 :
        500;

        return res.status(status).json({
        success: false,
        error: 'Error al cancelar la venta',
        details: msg,
        });
    }
};