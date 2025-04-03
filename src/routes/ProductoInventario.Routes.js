import { Router } from "express";
import { getProductoInventario, getProductsByInventory, 
    searchProduct, deleteLot,
    addMultipleProductsToInventory, addProductToInventory} from "../controllers/Producto_Inventario.Controllers.js";

const router = Router();
router.get('/api/v1/productoInventario',getProductoInventario);
router.get('/api/v1/productoInventario/:inventario_id', getProductsByInventory)
router.get('/api/v1/productoInventario/:inventario_id/producto/:codigo_barras', searchProduct)
router.delete('/api/v1/productoInventario/:inventario_id/producto/:codigo_barras/:lote', deleteLot)

router.post('/api/v1/productoInventario/:inventario_id/load', addProductToInventory);
router.post('/api/v1/productoInventario/:inventario_id/batch', addMultipleProductsToInventory); 

export default router;