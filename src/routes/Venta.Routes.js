import { Router } from "express";
import { getVentas } from "../controllers/Venta.Controllers";

const router = Router();

router.get('/api/v1/ventas',getVentas);

export default router;