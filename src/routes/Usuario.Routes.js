import { Router } from 'express';
import { getUsuarios, getUsuarioById, getUsuarioByName, 
    registerUser, registerAdmin, updateUser, deleteUser,
    sucursalAccess, getUserSucursal, logout} from '../controllers/Usuario.Controllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Ruta para acceso a sucursal sin token
router.post('/api/v1/usuarios/sucursal', sucursalAccess);

// Rutas protegidas con verificación de token
router.get('/api/v1/usuarios', verifyToken, getUsuarios);
router.get('/api/v1/usuarios/:usuario_id', verifyToken, getUsuarioById);
router.get('/api/v1/usuarios/search', verifyToken, getUsuarioByName);

router.get('/api/v1/usuarios/:usuario_id/sucursales', verifyToken, getUserSucursal);

router.post('/api/v1/usuarios', verifyToken, registerUser);
router.post('/api/v1/usuarios/admin', verifyToken, registerAdmin);
router.put('/api/v1/usuarios/:usuario_id', verifyToken, updateUser);
router.delete('/api/v1/usuarios/:usuario_id', verifyToken, deleteUser);

router.post('/api/v1/usuarios/logout', verifyToken, logout);

export default router;