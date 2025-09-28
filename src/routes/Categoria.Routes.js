import { Router } from 'express';
import { getCategorias,getCategoriasById,getCategoriasByname,registerCategoria,updateCategoria,deleteCategoria } from '../controllers/Categoria.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/categorias',  getCategorias);
router.get('/api/v1/categorias/:categoria_id',getCategoriasById);
router.get('/api/v1/categorias/search',  getCategoriasByname);
router.post('/api/v1/categorias/register', registerCategoria);
router.put('/api/v1/categorias/:categoria_id',  updateCategoria);
router.delete('/api/v1/categorias/:categoria_id',  deleteCategoria);

export default router;