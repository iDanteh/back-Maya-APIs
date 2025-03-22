import { Router } from 'express';
import { getCategorias } from '../controllers/Categoria.Controllers.js';

const router = Router();

router.get('/api/v1/categorias', getCategorias);

export default router;