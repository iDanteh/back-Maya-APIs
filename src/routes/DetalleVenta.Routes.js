import { Router } from "express";
import { getVentaById } from "../controllers/Detalle_venta.Controllers.js";
const router = Router();
router.get('/api/v1/detalleVenta/:venta_id',getVentaById);

export default router;