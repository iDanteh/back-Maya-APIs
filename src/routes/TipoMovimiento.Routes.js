import { Router } from "express";
/*import {getTipoMovimiento,getTipoMovimientoById,registerTipoMovimiento,updateTipoMovimiento,deleteTipoMovimiento} from '../controllers/Tipo_movimiento.Controllers.js';

const router = Router();

router.get('/api/v1/tipoMovimientos', getTipoMovimiento);
router.post('/api/v1/tipoMovimientos/register',registerTipoMovimiento);
router.get('/api/v1/tipoMovimientos/:tipo_movimiento_id',getTipoMovimientoById);
router.put('/api/v1/tipoMovimientos/:tipo_movimiento_id',updateTipoMovimiento);
router.delete('/api/v1/tipoMovimientos/:tipo_movimiento_id',deleteTipoMovimiento);*/
import { verifyToken } from '../middlewares/auth.js';
import { 
    getTiposMovimiento,
    getTipoMovimientoById,
    getTiposByFactor,
    registerTipoMovimiento,
    updateTipoMovimiento,
    deleteTipoMovimiento
} from '../controllers/Tipo_movimiento.Controllers.js';

const router = Router();

router.get('/api/v1/tipoMovimientos', verifyToken, getTiposMovimiento);
router.get('/api/v1/tipoMovimientos/:tipo_movimiento_id', verifyToken, getTipoMovimientoById);
router.get('/api/v1/tipoMovimientos/factor/:factor', verifyToken, getTiposByFactor);
router.post('/api/v1/tipoMovimientos/register', verifyToken, registerTipoMovimiento);
router.put('/api/v1/tipoMovimientos/:tipo_movimiento_id', verifyToken, updateTipoMovimiento);
router.delete('/api/v1/tipoMovimientos/:tipo_movimiento_id', verifyToken, deleteTipoMovimiento);

export default router;
