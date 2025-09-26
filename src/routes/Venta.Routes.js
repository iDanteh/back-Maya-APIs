import { Router } from "express";
import { getVenta, getVentasByFecha, getVentasBySucursal,
    createVenta, anularVenta, getVentasPorUsuarioYFecha,
    getVentasPorSucursalYFecha
} from "../controllers/Venta.Controllers.js";
import { verifyToken } from '../middlewares/auth.js';

const router = Router();


// Crear una nueva venta
router.post('/api/v1/ventas', verifyToken, createVenta);

// Obtener una venta específica
router.get('/api/v1/ventas/:venta_id', verifyToken, getVenta);

// Obtener ventas por sucursal
router.get('/api/v1/ventas/:sucursal_id/sucursal', verifyToken, getVentasBySucursal);

// Anular una venta
router.put('/api/v1/ventas/:venta_id/anular', verifyToken, anularVenta);

// Obtener ventas por rango de fechas (opcionalmente filtrado por sucursal)
router.get('/api/v1/ventas', verifyToken, getVentasByFecha);

router.get('/api/v1/ventas/cortePersonal/:sucursal_id/:usuario_id/:fecha/:tipo?', verifyToken, getVentasPorUsuarioYFecha);

router.get('/api/v1/ventas/corteSucursal/sucursal/:sucursal_id/:fecha/:tipo?', verifyToken, getVentasPorSucursalYFecha);

export default router;