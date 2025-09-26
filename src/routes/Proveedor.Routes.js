import { Router } from 'express';
import { getProveedores, getProveedorById, getProveedorByName, registerProveedor, updateProveedor, deleteProveedor } from '../controllers/Proveedor.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/proveedores', verifyToken, getProveedores);
router.get('/api/v1/proveedores/:proveedor_id', verifyToken, getProveedorById);
router.get('/api/v1/proveedores/nombre', verifyToken, getProveedorByName);
router.post('/api/v1/proveedores', verifyToken, registerProveedor);
router.put('/api/v1/proveedores/:proveedor_id', verifyToken, updateProveedor);
router.delete('/api/v1/proveedores/:proveedor_id', verifyToken, deleteProveedor);

export default router;