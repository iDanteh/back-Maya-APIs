import { Router } from "express";
import {getTipoMovimiento,getTipoMovimientoById,registerTipoMovimiento,updateTipoMovimiento,deleteTipoMovimiento} from '../controllers/Tipo_movimiento.Controllers';

const router = Router();

router.get('/api/v1/tipoMovimientos', getTipoMovimiento);
router.post('/api/v1/tipoMovimientos/register',registerTipoMovimiento);
router.get('/api/v1/tipoMovimientos/:tipo_movimiento_id',getTipoMovimientoById);
router.put('/api/v1/tipoMovimientos/:tipo_movimiento_id',updateTipoMovimiento);
router.delete('/api/v1/tipoMovimientos/:tipo_movimiento_id',deleteTipoMovimiento);

export default router;
