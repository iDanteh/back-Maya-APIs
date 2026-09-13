import { Router } from 'express';
import { getVentasSucursales, getTopProductos, getProductosPorCaducar, getVentasDiarias, getTopUsuarios, getVentasMensuales } from '../controllers/Metricas.Controllers.js';

const router = Router();
router.get('/api/v1/metricas/ventas-sucursales', getVentasSucursales);
router.get('/api/v1/metricas/top-productos', getTopProductos);
router.get('/api/v1/metricas/productos-por-caducar', getProductosPorCaducar);
router.get('/api/v1/metricas/ventas-diarias', getVentasDiarias);
router.get('/api/v1/metricas/top-usuarios', getTopUsuarios);
router.get('/api/v1/metricas/ventas-mensuales', getVentasMensuales);

export default router;