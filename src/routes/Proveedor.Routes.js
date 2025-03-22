import { Router } from 'express';
import { getProveedores } from '../controllers/Proveedor.Controllers.js';

const router = Router();

router.get('/api/v1/proveedores', getProveedores);

export default router;