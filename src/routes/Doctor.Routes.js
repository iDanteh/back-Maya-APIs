import { Router } from 'express';
import { createDoctor, getDoctorById, getDoctors } from '../controllers/Doctores.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.post('/api/v1/doctores', verifyToken, createDoctor);
router.get('/api/v1/doctores', verifyToken, getDoctors);
router.get('/api/v1/doctores/:cedula_id', verifyToken, getDoctorById);

export default router;