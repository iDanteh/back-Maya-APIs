import { Router } from "express";
import { getMovimientos } from "../controllers/Movimiento_Inventario.Controllers";

const router = Router();

router.get('/api/v1/movimientosInventario',getMovimientos);

export default router;