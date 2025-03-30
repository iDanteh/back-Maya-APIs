import { Router } from "express";
/*import {getTipoMovimiento,getTipoMovimientoById,registerTipoMovimiento,updateTipoMovimiento,deleteTipoMovimiento} from '../controllers/Tipo_movimiento.Controllers.js';

const router = Router();

router.get('/api/v1/tipoMovimientos', getTipoMovimiento);
router.post('/api/v1/tipoMovimientos/register',registerTipoMovimiento);
router.get('/api/v1/tipoMovimientos/:tipo_movimiento_id',getTipoMovimientoById);
router.put('/api/v1/tipoMovimientos/:tipo_movimiento_id',updateTipoMovimiento);
router.delete('/api/v1/tipoMovimientos/:tipo_movimiento_id',deleteTipoMovimiento);*/

import { 
    getTiposMovimiento,
    getTipoMovimientoById,
    getTiposByFactor,
    registerTipoMovimiento,
    updateTipoMovimiento,
    deleteTipoMovimiento
} from '../controllers/Tipo_MovimientoController.js';

const router = Router();

router.get('/api/v1/tipoMovimientos', getTiposMovimiento);
router.get('/api/v1/tipoMovimientos/:tipo_movimiento_id', getTipoMovimientoById);
router.get('/api/v1/tipoMovimientos/factor/:factor', getTiposByFactor);
router.post('/api/v1/tipoMovimientos/register', registerTipoMovimiento);
router.put('/api/v1/tipoMovimientos/:tipo_movimiento_id', updateTipoMovimiento);
router.delete('/api/v1/tipoMovimientos/:tipo_movimiento_id', deleteTipoMovimiento);

export default router;
