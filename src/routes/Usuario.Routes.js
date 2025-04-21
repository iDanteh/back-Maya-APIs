import { Router } from 'express';
import { getUsuarios, getUsuarioById, getUsuarioByName, 
    registerUser, registerAdmin, updateUser, deleteUser,
    sucursalAccess, getUserSucursal} from '../controllers/Usuario.Controllers.js';

const router = Router();

router.get('/api/v1/usuarios', getUsuarios);
router.get('/api/v1/usuarios/:usuario_id', getUsuarioById);
router.get('/api/v1/usuarios/search', getUsuarioByName);

router.get('/api/v1/usuarios/:usuario_id/sucursales', getUserSucursal);


router.post('/api/v1/usuarios', registerUser);
router.post('/api/v1/usuarios/admin', registerAdmin);
router.put('/api/v1/usuarios/:usuario_id', updateUser);
router.delete('/api/v1/usuarios/:usuario_id', deleteUser);
router.post('/api/v1/usuarios/sucursal', sucursalAccess);

export default router;