import { Router } from 'express';
import { getProveedores, getProveedorById, getProveedorByName, registerProveedor, updateProveedor, deleteProveedor } from '../controllers/Proveedor.Controllers.js';

const router = Router();

router.get('/api/v1/proveedores', getProveedores);
router.get('/api/v1/proveedores/:proveedor_id', getProveedorById);
router.get('/api/v1/proveedores/nombre', getProveedorByName);
router.post('/api/v1/proveedores', registerProveedor);
router.put('/api/v1/proveedores/:proveedor_id', updateProveedor);
router.delete('/api/v1/proveedores/:proveedor_id', deleteProveedor);

export default router;