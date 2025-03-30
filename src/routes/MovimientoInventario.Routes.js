import { Router } from "express";
import { 
    getMovimientos,
    getMovimientosByProductInventory,
    getMovimientosByType,
    createMovimiento,
    createMultipleMovements,
    getMovementsByDate
} from '../controllers/Movimiento_inventario.Controllers.js';
const router = Router();

//router.get('/api/v1/movimientosInventario',getMovimientos);
router.get('/api/v1/movimientos', getMovimientos);
router.get('/api/v1/producto/:producto_inventario_id', getMovimientosByProductInventory);
router.get('/api/v1/tipo/:tipo_movimiento_id', getMovimientosByType);
router.get('/api/v1/fecha', getMovementsByDate);
router.post('/api/v1/movimientos', createMovimiento);
router.post('/api/v1/multiple', createMultipleMovements);

export default router;