import { Router } from "express";
import { getVenta, getVentasByFecha, getVentasBySucursal,
    createVenta, anularVenta
} from "../controllers/Venta.Controllers.js";

const router = Router();


// Crear una nueva venta
router.post('/api/v1/ventas', createVenta);

// Obtener una venta específica
router.get('/api/v1/ventas/:venta_id', getVenta);

// Obtener ventas por sucursal
router.get('/api/v1/ventas/:sucursal_id/sucursal', getVentasBySucursal);

// Anular una venta
router.put('/api/v1/ventas/:venta_id/anular', anularVenta);

// Obtener ventas por rango de fechas (opcionalmente filtrado por sucursal)
router.get('/api/v1/ventas', getVentasByFecha);

export default router;