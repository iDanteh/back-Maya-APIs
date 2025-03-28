import { Router } from 'express';
import { getInventarios } from '../controllers/Inventario.Controllers.js';

const router = Router();

router.get('/api/v1/inventarios', getInventarios);

export default router;