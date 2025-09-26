import { Router } from "express";
import { 
    getMovimientos,
    getMovimientosByProductInventory,
    getMovimientosByType,
    createMovimiento,
    createMultipleMovements,
    getMovementsByDate,
    getEntradasBySucursal,
    getSalidasBySucursal
} from '../controllers/Movimiento_inventario.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

//router.get('/api/v1/movimientosInventario',getMovimientos);
router.get('/api/v1/movimientos', verifyToken, getMovimientos);
router.get('/api/v1/producto/:producto_inventario_id', verifyToken, getMovimientosByProductInventory);
router.get('/api/v1/tipo/:tipo_movimiento_id', verifyToken, getMovimientosByType);
router.get('/api/v1/fecha', verifyToken, getMovementsByDate);
router.post('/api/v1/movimientos', verifyToken, createMovimiento);
router.post('/api/v1/multiple', verifyToken, createMultipleMovements);

router.get('/api/v1/movimientos/entradas/:sucursal_id', verifyToken, getEntradasBySucursal);
router.get('/api/v1/movimientos/salidas/:sucursal_id', verifyToken, getSalidasBySucursal);
export default router;