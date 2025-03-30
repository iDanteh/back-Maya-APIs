import Venta from '../models/Venta.Model.js';
import Detalle_Venta from '../models/Detalle_Venta.Model.js';
import Producto_Inventario from '../models/Producto_Inventario.Model.js';
import Inventario from '../models/Inventario.Model.js'
import { VentaRepository } from '../repositories/VentaRepository.js';

const ventaRepository = new VentaRepository(Venta, Detalle_Venta, Producto_Inventario, Inventario);

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
            venta_id: `V-${Date.now()}`,
            sucursal_id,
            usuario_id,
            total,
            total_recibido: total_recibido || total, // Si no se especifica, asumimos que se pagó exacto
            numero_factura: `FAC-${Date.now()}`,
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

export const anularVenta = async (req, res) => {
    try {
        const { venta_id } = req.params;
        const ventaAnulada = await ventaRepository.anularVenta(venta_id);
        
        res.json({
            message: 'Venta anulada exitosamente',
            venta: {
                venta_id: ventaAnulada.venta_id,
                anulada: ventaAnulada.anulada,
                detalles: ventaAnulada.detalles.map(d => ({
                    detalle_venta_id: d.detalle_venta_id,
                    codigo_barras: d.codigo_barras,
                    lote: d.lote,
                    cantidad: d.cantidad
                }))
            }
        });
        
    } catch (error) {
        const statusCode = error.message.includes('no encontrad') || 
                         error.message.includes('ya está anulada') ? 400 : 500;
        
        res.status(statusCode).json({ 
            error: 'Error al anular la venta',
            details: error.message 
        });
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