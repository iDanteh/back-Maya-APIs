import { Router } from "express";
import { getProductoInventario } from "../controllers/Producto_Inventario.Controllers";

const router = Router();
router.get('/api/v1/productoInventario',getProductoInventario);

export default router;