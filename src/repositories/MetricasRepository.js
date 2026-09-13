import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);
import { QueryTypes } from 'sequelize';

export class MetricasRepository {
    constructor(sucursalModel, usuarioModel, ventaModel, detalleVentaModel, productoModel, productoInventarioModel, categoriaModel, tipoMovimientoModel) {
        this.sucursalModel = sucursalModel;
        this.usuarioModel = usuarioModel;
        this.ventaModel = ventaModel;
        this.detalleVentaModel = detalleVentaModel;
        this.productoModel = productoModel;
        this.productoInventarioModel = productoInventarioModel;
        this.categoriaModel = categoriaModel;
        this.tipoMovimientoModel = tipoMovimientoModel;
        this.sequelize = ventaModel.sequelize;
    }

    _rangoPeriodo(periodo) {
        const dias = periodo === '30d' ? 30 : 7;
        const zona = 'America/Mexico_City';

        const finActual = dayjs().tz(zona).endOf('day');
        const inicioActual = dayjs().tz(zona).subtract(dias - 1, 'day').startOf('day');
        const finAnterior = inicioActual.subtract(1, 'second');
        const inicioAnterior = finAnterior.tz(zona).subtract(dias - 1, 'day').startOf('day');

        return {
            actual: { inicio: inicioActual.format('YYYY-MM-DD HH:mm:ss'), fin: finActual.format('YYYY-MM-DD HH:mm:ss') },
            anterior: { inicio: inicioAnterior.format('YYYY-MM-DD HH:mm:ss'), fin: finAnterior.format('YYYY-MM-DD HH:mm:ss') },
        };
    }

    // 1) Ventas por sucursal + comparación vs período anterior
    async getVentasSucursales(periodo = '7d') {
        const { actual, anterior } = this._rangoPeriodo(periodo);

        const sql = `
            SELECT
                s.sucursal_id,
                s.nombre,
                COALESCE(SUM(CASE WHEN v.fecha_venta BETWEEN :inicioActual AND :finActual THEN v.total END), 0) AS ventas,
                COALESCE(SUM(CASE WHEN v.fecha_venta BETWEEN :inicioAnterior AND :finAnterior THEN v.total END), 0) AS ventas_periodo_anterior
            FROM sucursal s
            LEFT JOIN venta v
                ON v.sucursal_id = s.sucursal_id
                AND v.anulada = 0
                AND v.fecha_venta BETWEEN :inicioAnterior AND :finActual
            GROUP BY s.sucursal_id, s.nombre
            ORDER BY ventas DESC
        `;

        const rows = await this.sequelize.query(sql, {
            replacements: {
                inicioActual: actual.inicio,
                finActual: actual.fin,
                inicioAnterior: anterior.inicio,
                finAnterior: anterior.fin,
            },
            type: QueryTypes.SELECT,
        });

        return rows.map((r) => {
            const ventas = Number(r.ventas);
            const ventasPrevias = Number(r.ventas_periodo_anterior);
            const variacionPct = ventasPrevias > 0
                ? Math.round(((ventas - ventasPrevias) / ventasPrevias) * 100)
                : (ventas > 0 ? 100 : 0);
            return {
                sucursal_id: r.sucursal_id,
                nombre: r.nombre,
                ventas,
                ventas_periodo_anterior: ventasPrevias,
                variacion_pct: variacionPct,
            };
        });
    }

    // 2) Top productos por unidades vendidas
    async getTopProductos({ periodo = '7d', sucursalId, limit = 5 } = {}) {
        const { actual } = this._rangoPeriodo(periodo);

        const sql = `
            SELECT
                p.codigo_barras,
                p.descripcion AS nombre,
                SUM(dv.cantidad) AS unidades
            FROM detalle_venta dv
            INNER JOIN venta v ON v.venta_id = dv.venta_id
            INNER JOIN producto p ON p.codigo_barras = dv.codigo_barras
            WHERE v.anulada = 0
                AND v.fecha_venta BETWEEN :inicio AND :fin
                ${sucursalId ? 'AND dv.sucursal_id = :sucursalId' : ''}
            GROUP BY p.codigo_barras, p.nombre
            ORDER BY unidades DESC
            LIMIT :limit
        `;

        const rows = await this.sequelize.query(sql, {
            replacements: { inicio: actual.inicio, fin: actual.fin, sucursalId: sucursalId || null, limit },
            type: QueryTypes.SELECT,
        });

        return rows.map((r) => ({
            codigo_barras: r.codigo_barras,
            nombre: r.nombre,
            unidades: Number(r.unidades) || 0,
        }));
    }

    // 3) Productos por caducar (lotes con existencias activas y próximos a vencer)
    async getProductosPorCaducar({ sucursalId, dias = 45 } = {}) {
        const limite = dayjs().add(dias, 'day').format('YYYY-MM-DD');

        const sql = `
            SELECT
                pi.producto_inventario_id,
                pi.lote,
                pi.fecha_caducidad,
                pi.existencias AS cantidad,
                p.descripcion AS nombre,
                s.sucursal_id,
                s.nombre AS sucursal_nombre
            FROM producto_inventario pi
            INNER JOIN producto p ON p.codigo_barras = pi.codigo_barras
            INNER JOIN sucursal s ON s.sucursal_id = pi.sucursal_id
            WHERE pi.is_active = 1
                AND pi.existencias > 0
                AND pi.fecha_caducidad IS NOT NULL
                AND pi.fecha_caducidad <= :limite
                ${sucursalId ? 'AND pi.sucursal_id = :sucursalId' : ''}
            ORDER BY pi.fecha_caducidad ASC
        `;

        const rows = await this.sequelize.query(sql, {
            replacements: { limite, sucursalId: sucursalId || null },
            type: QueryTypes.SELECT,
        });

        const hoy = dayjs().startOf('day');
        return rows.map((r) => ({
            producto_inventario_id: r.producto_inventario_id,
            nombre: r.nombre,
            lote: r.lote,
            cantidad: r.cantidad,
            sucursal_id: r.sucursal_id,
            sucursal_nombre: r.sucursal_nombre,
            dias_restantes: dayjs(r.fecha_caducidad).startOf('day').diff(hoy, 'day'),
        }));
    }

    // 4) Serie diaria de ventas (para gráfica de tendencia)
    async getVentasDiarias({ periodo = '7d', sucursalId } = {}) {
        const { actual } = this._rangoPeriodo(periodo);

        const sql = `
            SELECT
                DATE(v.fecha_venta) AS fecha,
                SUM(v.total) AS ventas
            FROM venta v
            WHERE v.anulada = 0
                AND v.fecha_venta BETWEEN :inicio AND :fin
                ${sucursalId ? 'AND v.sucursal_id = :sucursalId' : ''}
            GROUP BY DATE(v.fecha_venta)
            ORDER BY fecha ASC
        `;

        const rows = await this.sequelize.query(sql, {
            replacements: { inicio: actual.inicio, fin: actual.fin, sucursalId: sucursalId || null },
            type: QueryTypes.SELECT,
        });

        const zona = 'America/Mexico_City';
        const ventasPorFecha = new Map(
            rows.map((r) => [dayjs.tz(r.fecha, zona).format('YYYY-MM-DD'), Number(r.ventas) || 0])
        );

        const inicio = dayjs.tz(actual.inicio, zona).startOf('day');
        const fin = dayjs.tz(actual.fin, zona).startOf('day');

        const serie = [];
        for (let dia = inicio; !dia.isAfter(fin); dia = dia.add(1, 'day')) {
            const fecha = dia.format('YYYY-MM-DD');
            serie.push({ fecha, ventas: ventasPorFecha.get(fecha) || 0 });
        }

        return serie;
    }

    // 5) Top usuarios por monto vendido
    async getTopUsuarios({ periodo = '7d', sucursalId, limit = 5 } = {}) {
        const { actual } = this._rangoPeriodo(periodo);

        const sql = `
            SELECT
                v.usuario_id,
                u.nombre AS nombre,
                SUM(v.total) AS monto_total,
                COUNT(v.venta_id) AS cantidad_ventas
            FROM venta v
            INNER JOIN usuario u ON u.usuario_id = v.usuario_id
            WHERE v.anulada = 0
                AND v.fecha_venta BETWEEN :inicio AND :fin
                ${sucursalId ? 'AND v.sucursal_id = :sucursalId' : ''}
            GROUP BY v.usuario_id, u.nombre
            ORDER BY monto_total DESC
            LIMIT :limit
        `;

        const rows = await this.sequelize.query(sql, {
            replacements: { inicio: actual.inicio, fin: actual.fin, sucursalId: sucursalId || null, limit },
            type: QueryTypes.SELECT,
        });

        return rows.map((r) => ({
            usuario_id: r.usuario_id,
            nombre: r.nombre,
            monto_total: Number(r.monto_total) || 0,
            cantidad_ventas: Number(r.cantidad_ventas) || 0,
        }));
    }

    // 6) Serie mensual de ventas (para gráfica de tendencia mensual)
    async getVentasMensuales({ meses = 12, sucursalId } = {}) {
        const zona = 'America/Mexico_City';

        const finActual = dayjs().tz(zona).endOf('month');
        const inicioActual = dayjs().tz(zona).subtract(meses - 1, 'month').startOf('month');

        const inicio = inicioActual.format('YYYY-MM-DD HH:mm:ss');
        const fin = finActual.format('YYYY-MM-DD HH:mm:ss');

        const sql = `
            SELECT
                DATE_FORMAT(v.fecha_venta, '%Y-%m') AS mes,
                SUM(v.total) AS ventas
            FROM venta v
            WHERE v.anulada = 0
                AND v.fecha_venta BETWEEN :inicio AND :fin
                ${sucursalId ? 'AND v.sucursal_id = :sucursalId' : ''}
            GROUP BY DATE_FORMAT(v.fecha_venta, '%Y-%m')
            ORDER BY mes ASC
        `;

        const rows = await this.sequelize.query(sql, {
            replacements: { inicio, fin, sucursalId: sucursalId || null },
            type: QueryTypes.SELECT,
        });

        const ventasPorMes = new Map(
            rows.map((r) => [dayjs.tz(r.mes, zona).format('YYYY-MM'), Number(r.ventas) || 0])
        );

        const serie = [];
        for (let mes = inicioActual; !mes.isAfter(finActual); mes = mes.add(1, 'month')) {
            const clave = mes.format('YYYY-MM');
            serie.push({ mes: clave, ventas: ventasPorMes.get(clave) || 0 });
        }

        return serie;
    }
}

export default MetricasRepository;