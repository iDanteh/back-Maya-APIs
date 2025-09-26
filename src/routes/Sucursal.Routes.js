import { Router } from 'express';
import { getSucursales, getSucursalById, getSucursalByName, 
    registerSucursal, updateSucursal, deleteSucursal,
    loginSucursal} from '../controllers/Sucursal.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/sucursales', verifyToken, getSucursales);
router.get('/api/v1/sucursales/:sucursal_id', verifyToken, getSucursalById);
router.get('/api/v1/sucursales/search', verifyToken, getSucursalByName);
router.post('/api/v1/sucursales', verifyToken, registerSucursal);
router.put('/api/v1/sucursales/:sucursal_id', verifyToken, updateSucursal);
router.delete('/api/v1/sucursales/:sucursal_id', verifyToken, deleteSucursal);
router.post('/api/v1/sucursales/login', verifyToken, loginSucursal);

export default router;