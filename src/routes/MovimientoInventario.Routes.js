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
router.get('/api/v1/movimientos',  getMovimientos);
router.get('/api/v1/producto/:producto_inventario_id',  getMovimientosByProductInventory);
router.get('/api/v1/tipo/:tipo_movimiento_id',  getMovimientosByType);
router.get('/api/v1/fecha',  getMovementsByDate);
router.post('/api/v1/movimientos',  createMovimiento);
router.post('/api/v1/multiple', createMultipleMovements);

router.get('/api/v1/movimientos/entradas/:sucursal_id', getEntradasBySucursal);
router.get('/api/v1/movimientos/salidas/:sucursal_id',  getSalidasBySucursal);
export default router;