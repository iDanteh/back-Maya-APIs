import { Router } from 'express';
import { getCategorias,getCategoriasById,getCategoriasByname,registerCategoria,updateCategoria,deleteCategoria } from '../controllers/Categoria.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/categorias', verifyToken, getCategorias);
router.get('/api/v1/categorias/:categoria_id', verifyToken, getCategoriasById);
router.get('/api/v1/categorias/search', verifyToken, getCategoriasByname);
router.post('/api/v1/categorias/register', verifyToken, registerCategoria);
router.put('/api/v1/categorias/:categoria_id', verifyToken, updateCategoria);
router.delete('/api/v1/categorias/:categoria_id', verifyToken, deleteCategoria);

export default router;