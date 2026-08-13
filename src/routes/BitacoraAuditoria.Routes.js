import { Router } from "express";
import { getBitacora } from "../controllers/BitacoraAuditoria.Controllers.js";

const router = Router();

router.get('/api/v1/bitacora', getBitacora);

export default router;
