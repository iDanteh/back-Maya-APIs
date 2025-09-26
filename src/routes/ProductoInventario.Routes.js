import { Router } from "express";
import { getProductoInventario, getProductsByInventory, 
    searchProduct, deleteLot, transferirProducto, transferirMultiplesProductos,
    addMultipleProductsToInventory, addProductToInventory, updateProductData, getFaltantesProductsByInventory} from "../controllers/Producto_Inventario.Controllers.js";
import { verifyToken } from '../middlewares/auth.js';

const router = Router();
router.get('/api/v1/productoInventario', verifyToken, getProductoInventario);
router.get('/api/v1/productoInventario/:sucursal_id', verifyToken, getProductsByInventory)
router.get('/api/v1/productoInventario/:sucursal_id/producto/:codigo_barras', verifyToken, searchProduct)
router.delete('/api/v1/productoInventario/:sucursal_id/producto/:codigo_barras/:lote', verifyToken, deleteLot)

router.post('/api/v1/productoInventario/:sucursal_id/load', verifyToken, addProductToInventory);
router.post('/api/v1/productoInventario/:sucursal_id/batch', verifyToken, addMultipleProductsToInventory); 

router.put('/api/v1/productoInventario/:producto_inventario_id', verifyToken, updateProductData);

router.post('/api/v1/productoInventario/transferir', verifyToken, transferirProducto); 
router.post('/api/v1/productoInventario/transferir-multiples', verifyToken, transferirMultiplesProductos);

// Ruta para obtener productos faltantes (sin stock) en una sucursal
router.get('/api/v1/productoInventario/faltantes/:sucursal_id', verifyToken, getFaltantesProductsByInventory)

export default router;