import { Router } from 'express';
import { getProductos, getProductosById, createProducto, updateProducto, deleteProduct, restoreProduct } from '../controllers/Producto.Controllers.js'
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/productos',  getProductos);
router.get('/api/v1/productos/:codigo_barras',  getProductosById);
router.post('/api/v1/productos',  createProducto);
router.put('/api/v1/productos/:codigo_barras',  updateProducto);
router.delete('/api/v1/productos/:codigo_barras',  deleteProduct);
router.patch('/api/v1/productos/:codigo_barras/restore',  restoreProduct);

export default router;