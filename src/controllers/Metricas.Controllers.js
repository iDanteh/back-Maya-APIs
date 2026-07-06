import Sucursal from '../models/Sucursal.Model.js';
import Usuario from '../models/Usuario.Model.js';
import Venta from '../models/Venta.Model.js';
import DetalleVenta from '../models/Detalle_Venta.Model.js';
import Producto from '../models/Producto.Model.js';
import ProductoInventario from '../models/Producto_Inventario.Model.js';
import Categoria from '../models/Categoria.Model.js';
import TipoMovimiento from '../models/Tipo_Movimiento.Model.js';
import { MetricasRepository } from '../repositories/MetricasRepository.js';
import ApiError from '../utils/ApiError.js';
import Response from '../utils/response.js';

const metricasRepository = new MetricasRepository(
    Sucursal, Usuario, Venta, DetalleVenta, Producto, ProductoInventario, Categoria, TipoMovimiento
);

const PERIODOS_VALIDOS = ['7d', '30d'];

export const getVentasSucursales = async (req, res, next) => {
    try {
        const { periodo = '7d' } = req.query;
        if (!PERIODOS_VALIDOS.includes(periodo)) {
            throw new ApiError(400, `periodo inválido, usa: ${PERIODOS_VALIDOS.join(', ')}`);
        }
        const data = await metricasRepository.getVentasSucursales(periodo);
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};

export const getTopProductos = async (req, res, next) => {
    try {
        const { periodo = '7d', sucursalId, limit } = req.query;
        if (!PERIODOS_VALIDOS.includes(periodo)) {
            throw new ApiError(400, `periodo inválido, usa: ${PERIODOS_VALIDOS.join(', ')}`);
        }
        const data = await metricasRepository.getTopProductos({
            periodo,
            sucursalId: sucursalId || undefined,
            limit: limit ? Number(limit) : 5,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};

export const getProductosPorCaducar = async (req, res, next) => {
    try {
        const { sucursalId, dias } = req.query;
        const data = await metricasRepository.getProductosPorCaducar({
            sucursalId: sucursalId || undefined,
            dias: dias ? Number(dias) : 45,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};