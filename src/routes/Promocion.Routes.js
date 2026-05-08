import { Router } from 'express';
import {
    getPromociones,
    getPromocionById,
    getPromocionByBarcode,
    getPromocionByGrupo,
    registerPromocion,
    registerPromocionSurtido,
    updatePromocion,
    deletePromocion,
} from '../controllers/Promocion.Controllers.js';

const router = Router();

// Rutas específicas ANTES de las parametrizadas para evitar conflictos
router.get('/api/v1/promociones/producto/:codigo_barras', getPromocionByBarcode);
router.get('/api/v1/promociones/surtido/:grupo_surtido', getPromocionByGrupo);
router.get('/api/v1/promociones', getPromociones);
router.get('/api/v1/promociones/:promocion_id', getPromocionById);
router.post('/api/v1/promociones/register', registerPromocion);
router.post('/api/v1/promociones/register-surtido', registerPromocionSurtido);
router.put('/api/v1/promociones/:promocion_id', updatePromocion);
router.delete('/api/v1/promociones/:promocion_id', deletePromocion);

export default router;
