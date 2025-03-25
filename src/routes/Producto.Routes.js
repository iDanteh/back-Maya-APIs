import { Router } from 'express';
import { getProductos } from '../controllers/Producto.Controllers.js'

const router = Router();

router.get('/api/v1/productos', getProductos);

export default router;