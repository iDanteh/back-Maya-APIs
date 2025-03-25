import { Router } from "express";
import { getMovimientos } from '../controllers/Movimiento_inventario.Controllers.js';
const router = Router();

router.get('/api/v1/movimientosInventario',getMovimientos);

export default router;