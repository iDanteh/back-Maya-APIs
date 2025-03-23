import { Router } from "express";
import { getDetalleVenta } from "../controllers/Detalle_venta.Controllers";
const router = Router();

router.get('/api/v1/detalleVenta',getDetalleVenta);

export default router;