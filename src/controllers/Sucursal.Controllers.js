import Sucursal from '../models/Sucursal.Model.js';
import Inventario from '../models/Inventario.Model.js';
import Producto_Inventario from '../models/Movimiento_Inventario.Model.js';
import { Op } from 'sequelize'

export const getSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.findAll();
        res.status(200).json(sucursales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las sucursales' });
    }
};

export const getSucursalById = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByPk(req.params.sucursal_id);

        if (!sucursal) {
            res.status(404).json({ error: 'Sucursal no encontrado' });
            return;
        }

        res.status(200).json(sucursal);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el Sucursal' });
    }
};

export const getSucursalByName = async (req, res) => {
    try {
        const { nombre } = req.query;

        const sucursales = await Sucursal.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%`
                }
            }
        })
        if (!sucursales.length) {
            return res.json([]);
        }
        res.status(200).json(sucursales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el Sucursal' });
    }
};

// Crear una sucursal nueva y crear su inventario
export const registerSucursal = async (req, res) => {
    try {
        const {sucursal_id, nombre, direccion} = req.body;

        const sucursalExist = await Sucursal.findOne({ where: {sucursal_id} });
        if (sucursalExist) {
            return res.status(409).json({ error: 'La sucursal ya existe o el ID está en uso' });
        }

        // Crear la sucursal
        const newSucursal = await Sucursal.create({sucursal_id, nombre, direccion});
        // console.log('Sucursal creada', newSucursal);

        // Crear el inventario de la sucursal
        const newInventario = await Inventario.create({sucursal_id: newSucursal.sucursal_id});
        // console.log('Inventario creado', newInventario);

        return res.status(201).json({ newSucursal, newInventario });
    } catch (error) {
        console.log('Error al registrar la sucursal:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSucursal = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByPk(req.params.sucursal_id);
        if (!sucursal) {
            return res.status(404).json({ error: 'Sucursal no encontrado' });
        }

        const { nombre, direccion, contraseña_sucursal } = req.body;

        sucursal.nombre = nombre;
        sucursal.direccion = direccion;
        sucursal.contraseña_sucursal = contraseña_sucursal;

        await sucursal.save();

        res.status(200).json({ message: 'Sucursal actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la sucursal' });
    }
};

export const deleteSucursal = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByPk(req.req.sucursal_id);
        if (!sucursal) {
            return res.status(404).json({ error: 'Sucursal no encontrado' });
        }
        await sucursal.destroy();
        res.status(200).json({ message: 'Sucursal eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el Sucursal' });
    }
};

export const loginSucursal = async (req, res) => {
    try {
        const { nombre, contraseña_sucursal } = req.body;
        const sucursal = await Sucursal.findOne({ where: { nombre, contraseña_sucursal } });
        if (!sucursal) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        return res.status(200).json({ message: 'Inicio de sesión exitoso', sucursal });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión'})
    }
}