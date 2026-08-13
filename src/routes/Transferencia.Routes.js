import { Router } from "express";
import { getTransferencias, getTransferenciaById } from "../controllers/Transferencia.Controllers.js";

const router = Router();

router.get('/api/v1/transferencias', getTransferencias);
router.get('/api/v1/transferencias/:transferencia_id', getTransferenciaById);

export default router;
