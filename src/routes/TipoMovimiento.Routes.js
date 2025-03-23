import { Router } from "express";
import {getTipoMovimiento} from '../controllers/Tipo_movimiento.Controllers';

const router = Router();

router.get('/api/v1/tipoMovimientos', getTipoMovimiento);

export default router;
