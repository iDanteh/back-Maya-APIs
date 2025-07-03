import Venta from '../models/Venta.Model.js';
import Detalle_Venta from '../models/Detalle_Venta.Model.js';
import Producto_Inventario from '../models/Producto_Inventario.Model.js';
import Inventario from '../models/Inventario.Model.js'
import { VentaRepository } from '../repositories/VentaRepository.js';
import MovimientoInventario from '../models/Movimiento_Inventario.Model.js';
import Producto from '../models/Producto.Model.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const ventaRepository = new VentaRepository(Venta, Detalle_Venta, Producto_Inventario, Inventario, MovimientoInventario);

export const createVenta = async (req, res) => {
    try {
        const { sucursal_id, usuario_id, total, total_recibido, detalles } = req.body;
        
        // Validación mejorada
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ error: 'Debe especificar al menos un producto con lote' });
        }

        // Verificar que todos los detalles tengan lote
        if (detalles.some(d => !d.lote)) {
            return res.status(400).json({ error: 'Todos los productos deben especificar un lote' });
        }

        const ventaData = {
            venta_id: `V${sucursal_id}-${Date.now()}`,
            sucursal_id,
            usuario_id,
            total,
            total_recibido: total_recibido || total,
            numero_factura: `FAC-${sucursal_id}-${Date.now()}-${usuario_id}`,
            fecha_venta: new Date()
        };

        const nuevaVenta = await ventaRepository.createVentaWithDetails(ventaData, detalles);
        
        res.status(201).json({
            message: 'Venta registrada exitosamente',
            venta: nuevaVenta
        });
        
    } catch (error) {
        const statusCode = error.message.includes('No hay suficiente stock') || 
                          error.message.includes('no encontrado') ? 400 : 500;
        
        res.status(statusCode).json({ 
            error: 'Error al registrar la venta',
            details: error.message 
        });
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
        const ventas = await ventaRepository.getVentasBySucursal(sucursal_id);
        
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVentasByFecha = async (req, res) => {
    try {
        const { sucursal_id, fecha_inicio, fecha_fin } = req.query;
        
        const whereClause = {
            fecha_venta: {
                [sequelize.Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            }
        };
        
        if (sucursal_id) {
            whereClause.sucursal_id = sucursal_id;
        }
        
        const ventas = await Venta.findAll({
            where: whereClause,
            include: [{
                model: Detalle_Venta,
                as: 'detalles'
            }],
            order: [['fecha_venta', 'DESC']]
        });
        
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const anularVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;
        
        if (!venta_id) {
            return res.status(400).json({ error: 'Se requiere el ID de la venta' });
        }

        // Anular la venta y reintegrar existencias
        const resultado = await ventaRepository.anularVenta(venta_id);
        
        res.status(200).json({
            success: true,
            message: 'Venta anulada exitosamente',
            data: resultado
        });
        
    } catch (error) {
        console.error('Error en anularVenta:', error);
        
        const statusCode = error.message.includes('no encontrada') ? 404 : 
                          error.message.includes('ya está anulada') ? 400 : 500;
        
        res.status(statusCode).json({ 
            error: 'Error al anular la venta',
            details: error.message 
        });
    }
};

export const getVentasPorUsuarioYFecha = async (req, res) => {
    const { usuario_id, fecha, tipo = 'dia' } = req.params;

    console.log('🔍 Petición recibida con params:', { usuario_id, fecha, tipo });

    if (!usuario_id || !fecha) {
        console.warn('⚠️ Falta usuario_id o fecha');
        return res.status(400).json({ message: 'Faltan parámetros usuario_id o fecha' });
    }

    try {
        const venta = await ventaRepository.getCorteCaja(usuario_id, fecha, tipo);
        console.log('📦 Ventas encontradas:', venta.length);

        if (!venta || venta.length === 0) {
            console.warn('❌ No se encontraron ventas para ese usuario y fecha');
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const ventasFormateadas = venta.map(venta => ({
            ...venta,
            fecha_venta: dayjs(venta.fecha_venta).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss'),
        }));

        res.status(200).json(ventasFormateadas);
    } catch (error) {
        console.error('🔥 Error al obtener ventas', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getVentasPorSucursalYFecha = async (req, res) => {
    const { sucursal_id, fecha, tipo = 'dia' } = req.params;

    console.log('🔍 Petición recibida con params:', { sucursal_id, fecha, tipo });

    if (!sucursal_id || !fecha) {
        console.warn('⚠️ Falta sucursal_id o fecha');
        return res.status(400).json({ message: 'Faltan parámetros sucursal_id o fecha' });
    }

    try {
        const venta = await ventaRepository.getCorteCajaSucursal(sucursal_id, fecha, tipo);
        console.log('📦 Ventas encontradas:', venta.length);

        if (!venta || venta.length === 0) {
            console.warn('❌ No se encontraron ventas para ese usuario y fecha');
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const ventasFormateadas = venta.map(venta => ({
            ...venta,
            fecha_venta: dayjs(venta.fecha_venta).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss'),
        }));

        res.status(200).json(ventasFormateadas);
    } catch (error) {
        console.error('🔥 Error al obtener ventas', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};