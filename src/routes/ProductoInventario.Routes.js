import { Router } from "express";
import { getProductoInventario, getProductsByInventory, getSyncInventario,
    searchProduct, deleteLot, transferirProducto, transferirMultiplesProductos,
    addMultipleProductsToInventory, addProductToInventory, updateProductData, getFaltantesProductsByInventory,
    desactivarProductosCad,
<<<<<<< Updated upstream
    getProductosCaducados,
    getFaltanteByCategoria} from "../controllers/Producto_Inventario.Controllers.js";
=======
    getProductosCaducados, getSucursalesConStock} from "../controllers/Producto_Inventario.Controllers.js";
>>>>>>> Stashed changes
import { verifyToken } from '../middlewares/auth.js';

const router = Router();
router.get('/api/v1/productoInventario', getProductoInventario);
router.get('/api/v1/productoInventario/faltantesByCategoria', getFaltanteByCategoria);

// La ruta /sync debe definirse ANTES de /:sucursal_id para que Express no la trate como parámetro
router.get('/api/v1/productoInventario/:sucursal_id/sync', getSyncInventario);
router.get('/api/v1/productoInventario/:sucursal_id', getProductsByInventory)
router.get('/api/v1/productoInventario/:sucursal_id/producto/:codigo_barras', searchProduct)
// No colisiona con la ruta de arriba aunque tenga también 3 segmentos: Express compara
// posición por posición, y acá el primer segmento es el literal 'producto' en vez de
// :sucursal_id, así que ninguna de las dos puede interpretar una URL pensada para la otra.
router.get('/api/v1/productoInventario/producto/:codigo_barras/disponibilidad', getSucursalesConStock)
router.delete('/api/v1/productoInventario/:sucursal_id/producto/:codigo_barras/:lote',  deleteLot)

router.post('/api/v1/productoInventario/:sucursal_id/load',  addProductToInventory);
router.post('/api/v1/productoInventario/:sucursal_id/batch', addMultipleProductsToInventory); 

router.put('/api/v1/productoInventario/:producto_inventario_id',  updateProductData);

router.post('/api/v1/productoInventario/transferir', transferirProducto); 
router.post('/api/v1/productoInventario/transferir-multiples', transferirMultiplesProductos);

// Ruta para obtener productos faltantes (sin stock) en una sucursal
router.get('/api/v1/productoInventario/faltantes/:sucursal_id',  getFaltantesProductsByInventory);

router.get('/api/v1/productoInventario/visualizar/caducados/:sucursal_id',getProductosCaducados);

//Ruta para desactivar y actualizar los productos caducados
router.patch('/api/v1/productoInventario/:sucursal_id/caducados',desactivarProductosCad);

export default router;