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
        let limitValue = 5;
        if (limit !== undefined) {
            limitValue = Number(limit);
            if (!Number.isFinite(limitValue) || limitValue < 0) {
                throw new ApiError(400, 'limit debe ser un número mayor o igual a 0');
            }
        }
        const data = await metricasRepository.getTopProductos({
            periodo,
            sucursalId: sucursalId || undefined,
            limit: limitValue,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};

export const getProductosPorCaducar = async (req, res, next) => {
    try {
        const { sucursalId, dias } = req.query;
        let diasValue = 45;
        if (dias !== undefined) {
            diasValue = Number(dias);
            if (!Number.isFinite(diasValue) || diasValue < 0) {
                throw new ApiError(400, 'dias debe ser un número mayor o igual a 0');
            }
        }
        const data = await metricasRepository.getProductosPorCaducar({
            sucursalId: sucursalId || undefined,
            dias: diasValue,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};

export const getVentasDiarias = async (req, res, next) => {
    try {
        const { periodo = '7d', sucursalId } = req.query;
        if (!PERIODOS_VALIDOS.includes(periodo)) {
            throw new ApiError(400, `periodo inválido, usa: ${PERIODOS_VALIDOS.join(', ')}`);
        }
        const data = await metricasRepository.getVentasDiarias({
            periodo,
            sucursalId: sucursalId || undefined,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};

export const getTopUsuarios = async (req, res, next) => {
    try {
        const { periodo = '7d', sucursalId, limit } = req.query;
        if (!PERIODOS_VALIDOS.includes(periodo)) {
            throw new ApiError(400, `periodo inválido, usa: ${PERIODOS_VALIDOS.join(', ')}`);
        }
        let limitValue = 5;
        if (limit !== undefined) {
            limitValue = Number(limit);
            if (!Number.isFinite(limitValue) || limitValue < 0) {
                throw new ApiError(400, 'limit debe ser un número mayor o igual a 0');
            }
        }
        const data = await metricasRepository.getTopUsuarios({
            periodo,
            sucursalId: sucursalId || undefined,
            limit: limitValue,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};

export const getVentasMensuales = async (req, res, next) => {
    try {
        const { meses, sucursalId } = req.query;
        let mesesValue = 12;
        if (meses !== undefined) {
            mesesValue = Number(meses);
            if (!Number.isFinite(mesesValue) || mesesValue < 1) {
                throw new ApiError(400, 'meses debe ser un número mayor o igual a 1');
            }
        }
        const data = await metricasRepository.getVentasMensuales({
            meses: mesesValue,
            sucursalId: sucursalId || undefined,
        });
        return Response.success(res, data);
    } catch (error) {
        next(error);
    }
};