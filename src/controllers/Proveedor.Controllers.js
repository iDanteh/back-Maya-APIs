import { Op } from 'sequelize';
import Proveedor from '../models/Proveedor.Model.js';

export const getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll();
        res.status(200).json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los proveedores' });
    }
};

export const getProveedorById = async (req, res) => {
    try {
        try {
            const proveedor = await Proveedor.findByPk(req.params.proveedor_id);

            if (!proveedor) {
                res.status(404).json({ error: 'Proveedor no encontrado' });
                return;
            }

            res.status(200).json(proveedor);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el proveedor' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proveedor' });
        
    }
};

export const getProveedorByName = async (req, res) => {
    try {
        const { nombre } = req.query;

        const proveedores = await Proveedor.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%`
                }
            }
        })
        if (!proveedores.length) {
            return res.json([]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
};

export const registerProveedor = async (req, res) => {
    try {
        const {nombre, telefono, email, descripcion} = req.body;
        const newProveedor = await Proveedor.create({nombre, telefono, email, descripcion});

        return res.status(201).json({ newProveedor });
    } catch (error) {
        return res.status(500).json({ error: 'Error al registrar el proveedor' });
    }
};

export const updateProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.proveedor_id);
        if(!proveedor){
            return res.status(404).json({error: 'Proveedor no encontrado'});
        }

        const {nombre, telefono, email, descripcion} = req.body;
        proveedor.nombre = nombre;
        proveedo ;
        proveedor.telefono = telefono;
        proveedor.email = email;
        proveedor.descripcion = descripcion;
        await proveedor.save();
        res.status(200).json({message: 'Proveedor actualizado'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
};

export const deleteProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.proveedor_id);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        await proveedor.destroy();
        res.status(200).json({ message: 'Proveedor eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el proveedor' });
    }
};