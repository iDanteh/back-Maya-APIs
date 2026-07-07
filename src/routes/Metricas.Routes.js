import { Router } from 'express';
import { getVentasSucursales, getTopProductos, getProductosPorCaducar } from '../controllers/Metricas.Controllers.js';

const router = Router();
router.get('/ventas-sucursales', getVentasSucursales);
router.get('/top-productos', getTopProductos);
router.get('/productos-por-caducar', getProductosPorCaducar);

export default router;