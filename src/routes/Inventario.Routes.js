import { Router } from 'express';
import { getInventarios } from '../controllers/Inventario.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/inventarios', verifyToken, getInventarios);

export default router;