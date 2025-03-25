import Sucursal from '../models/Sucursal.Model.js';
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
        try {
            const sucursal = await Sucursal.findByPk(req.params.sucursal_id);

            if (!sucursal) {
                res.status(404).json({ error: 'Sucursal no encontrado' });
            }

            res.status(200).json(sucursal);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el Sucursal' });
        }
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
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el Sucursal' });
    }
};

export const registerSucursal = async (req, res) => {
    try {
        const {nombre, direccion, contraseña_sucursal} = req.body;
        const newSucursal = await Sucursal.create({nombre, descripción, direccion, contraseña_sucursal});

        return res.status(201).json({ newSucursal });
    } catch (error) {
        return res.status(500).json({ error: 'Error al registrar el Sucursal' });
    }
};

export const updateSucursal = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByPk(req.params.sucursal_id);
        if(!sucursal){
            return res.status(404).json({error: 'Sucursal no encontrado'});
        }

        const {nombre, direccion, contraseña_sucursal} = req.body;
        sucursal.nombre = nombre;
        sucursal.direccion = direccion;
        sucursal.contraseña_sucursal = contraseña_sucursal;
        await Sucursal.save();
        res.status(200).json({message: 'Sucursal actualizado'});
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el Sucursal' });
    }
};

export const deleteSucursal = async (req, res) => {
    try {
        const sucursal = await Sucursal.findByPk(req.params.sucursal_id);
        if (!sucursal) {
            return res.status(404).json({ error: 'Sucursal no encontrado' });
        }
        await sucursal.destroy();
        res.status(200).json({ message: 'Sucursal eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el Sucursal' });
    }
};