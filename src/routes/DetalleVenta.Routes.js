import { Router } from "express";
import { getVentaById } from "../controllers/Detalle_venta.Controllers.js";
import { verifyToken } from '../middlewares/auth.js';

const router = Router();
router.get('/api/v1/detalleVenta/:venta_id', verifyToken, getVentaById);

export default router;