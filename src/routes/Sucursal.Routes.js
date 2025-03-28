import { Router } from 'express';
import { getSucursales, getSucursalById, getSucursalByName, registerSucursal, updateSucursal, deleteSucursal } from '../controllers/Sucursal.Controllers.js';

const router = Router();

router.get('/api/v1/sucursales', getSucursales);
router.get('/api/v1/sucursales/:sucursal_id', getSucursalById);
router.get('/api/v1/sucursales/search', getSucursalByName);
router.post('/api/v1/sucursales', registerSucursal);
router.put('/api/v1/sucursales/:sucursal_id', updateSucursal);
router.delete('/api/v1/sucursales/:sucursal_id', deleteSucursal);

export default router;