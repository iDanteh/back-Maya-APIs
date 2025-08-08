import { Router } from 'express';
import { createDoctor, getDoctorById, getDoctors } from '../controllers/Doctores.Controllers.js';

const router = Router();

router.post('/api/v1/doctores', createDoctor);
router.get('/api/v1/doctores', getDoctors);
router.get('/api/v1/doctores/:cedula_id', getDoctorById);

export default router;