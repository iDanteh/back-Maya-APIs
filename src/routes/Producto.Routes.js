import { Router } from 'express';
import { getProductos, getProductosById, createProducto, updateProducto, deleteProduct } from '../controllers/Producto.Controllers.js'
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/api/v1/productos', verifyToken, getProductos);
router.get('/api/v1/productos/:codigo_barras', verifyToken, getProductosById);
router.post('/api/v1/productos', verifyToken, createProducto);
router.put('/api/v1/productos/:codigo_barras', verifyToken, updateProducto);
router.delete('/api/v1/productos/:codigo_barras', verifyToken, deleteProduct);

export default router;