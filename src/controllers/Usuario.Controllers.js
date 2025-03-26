import Usuario from '../models/Usuario.Model.js';
import { Op } from 'sequelize';

export const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
        return;
    }
};

export const getUsuarioById = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.usuario_id);

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

        const usuarios = await Usuario.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%`
                }
            }
        });
        if (!usuarios.length) {
            return res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
        return;
    }
};

export const registerUser = async (req, res) => {
    try {
        const rol = "trabajador";
        const { nombre, apellido, telefono, email, turno, usuario, clave_acceso, sucursal_id} = req.body;

        const emailExist = await Usuario.findOne({ where: { email } });
        if (emailExist) {
            return res.status(409).json({ error: 'El email ya está en uso' });
        }

        const newUser = await Usuario.create({ nombre, apellido, telefono, email, rol, turno, usuario, clave_acceso, sucursal_id });
        return res.status(201).json({ newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const { sucursal_id, nombre, apellido, telefono, email, rol, turno, usuario, clave_acceso } = req.body;

        const user = await Usuario.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await Usuario.update({ sucursal_id, nombre, apellido, telefono, email, rol, turno, usuario, clave_acceso }, { where: { usuario_id } });
        return res.status(200).json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const user = await Usuario.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await Usuario.destroy({ where: { usuario_id } });
        return res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};