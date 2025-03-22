import { Router } from 'express';
import { getUsuarios } from '../controllers/Usuario.Controllers.js';

const router = Router();

router.get('/api/v1/usuarios', getUsuarios);

export default router;