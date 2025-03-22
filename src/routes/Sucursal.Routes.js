import { Router } from 'express';
import { getSucursales } from '../controllers/Sucursal.Controllers.js';

const router = Router();

router.get('/api/v1/sucursales', getSucursales);

export default router;