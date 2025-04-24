import { Router } from "express";
import { getDetalleVenta, getVentaById } from "../controllers/Detalle_venta.Controllers.js";
const router = Router();

router.get('/api/v1/detalleVenta',getDetalleVenta);
router.get('/api/v1/detalleVenta/:venta_id',getVentaById);

export default router;