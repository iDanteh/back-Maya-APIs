import { Router } from "express";
import { getProductoInventario, getProductsByInventory, 
    searchProduct, deleteLot, transferirProducto, transferirMultiplesProductos,
    addMultipleProductsToInventory, addProductToInventory, updateProductData, getFaltantesProductsByInventory} from "../controllers/Producto_Inventario.Controllers.js";

const router = Router();
router.get('/api/v1/productoInventario',getProductoInventario);
router.get('/api/v1/productoInventario/:sucursal_id', getProductsByInventory)
router.get('/api/v1/productoInventario/:sucursal_id/producto/:codigo_barras', searchProduct)
router.delete('/api/v1/productoInventario/:sucursal_id/producto/:codigo_barras/:lote', deleteLot)

router.post('/api/v1/productoInventario/:sucursal_id/load', addProductToInventory);
router.post('/api/v1/productoInventario/:sucursal_id/batch', addMultipleProductsToInventory); 

router.put('/api/v1/productoInventario/:producto_inventario_id', updateProductData);

router.post('/api/v1/productoInventario/transferir', transferirProducto); 
router.post('/api/v1/productoInventario/transferir-multiples', transferirMultiplesProductos);

// Ruta para obtener productos faltantes (sin stock) en una sucursal
router.get('/api/v1/productoInventario/faltantes/:sucursal_id', getFaltantesProductsByInventory)

export default router;