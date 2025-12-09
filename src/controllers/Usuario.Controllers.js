import Usuario from '../models/Usuario.Model.js';
import Sucursal from '../models/Sucursal.Model.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js'

const usuarioRepo = new UsuarioRepository(Usuario, Sucursal);

export const getUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioRepo.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
        return;
    }
};

export const getUsuarioById = async (req, res) => {
    try {
        const usuario = await usuarioRepo.findById(req.params.usuario_id);

        if (!usuario) {
            res.status(404).json({ error: 'usuario no encontrado' });
            return;
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
        return;
    }
}

export const getUsuarioByName = async (req, res) => {
    try {
        const { nombre } = req.query;
        
        if (!nombre) {
            return res.status(400).json({ 
                error: 'El parámetro "nombre" es requerido' 
            });
        }

        const usuarios = await usuarioRepo.searchByName(nombre);

        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al buscar usuarios',
        });
    }
};

export const registerUser = async (req, res) => {
    try {
        const rol = "trabajador";
        const userData = { ...req.body, rol };
        userData.rol = rol;

        console.log('Datos recibidos:', userData);

        const emailExist = await usuarioRepo.findByEmail(userData.email);
        if (emailExist) {
            return res.status(400).json({ error: 'El email ya existe' });
        }

        const newUser = await usuarioRepo.create(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const registerAdmin = async (req, res) => {
    try {
        const rol = "administrador";
        // Para administradores, no requerimos sucursal_id
        const { sucursal_id, ...userData } = req.body;
        userData.rol = rol;

        console.log('Datos recibidos:', userData);

        if (!userData.email) {
            return res.status(400).json({ error: 'El campo email es requerido' });
        }        
        const emailExist = await usuarioRepo.findByEmail(userData.email);
        if (emailExist) {
            return res.status(400).json({ error: 'El email ya existe' });
        }

        const newUser = await usuarioRepo.createAdmin(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updateUser = await usuarioRepo.update(req.params.usuario_id, req.body);
        if (!updateUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(updateUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const success = await usuarioRepo.delete(req.params.usuario_id);
        if (!success) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

export const sucursalAccess = async (req, res) => {
    try {
        const { usuario, clave_acceso } = req.body;

        if (!usuario || !clave_acceso) {
            return res.status(400).json({ error: 'Usuario y clave de acceso son requeridos' });
        }

        let access;

        try {
            access = await usuarioRepo.sucursalAccess(usuario, clave_acceso);
        } catch (dbError) {
            console.error('Error de conexión al servidor:', dbError.message);
            return res.status(503).json({ error: 'Servidor no disponible, intenta más tarde' });
        }

        if (!access) {
            return res.status(401).json({ error: 'Usuario o clave incorrectos' });
        }

        res.status(200).json({ message: 'Acceso permitido', access });

    } catch (error) {
        console.error('Error inesperado en sucursalAccess:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const logout = (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(400).json({ error: 'No hay token' });

    const token = authHeader.split(' ')[1];
    invalidateToken(token);

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

export const getUserSucursal = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const sucursales = await usuarioRepo.getUserSucursal(usuario_id);
        res.status(200).json(sucursales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const reactivateUser = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const usuario = await usuarioRepo.reactivateUser(usuario_id);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}