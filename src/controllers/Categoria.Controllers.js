import { Op } from 'sequelize';
import Categoria from '../models/Categoria.Model.js';

export const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorias' });
    }
};

export const getCategoriasById = async (req, res) =>{
    try {
        const categoria = await Categoria.findByPk(req.params.categoria_id);

        if(!categoria){
            res.status(404).json({ error: 'categoria no encontrada'});
        }
        res.status(500).json({error: 'Error al obtener la categoria'});
    } catch (error) {
        res.status(500).json({error:'Error al obtener la categoria'});
    }
};

export const getCategoriasByname =async (req, res) => {
    try {
        const {nombre} = req.query;

        const categorias = await Categoria.findAll({
            where:{
                nombre:{
                    [Op.like]: `%${nombre}%`
                }
            }
        });
        if(!categorias.length){
            return res.json([]);
        }
    } catch (error) {
        console.error('Error al buscar categorias: ',error);
        res.status(500).json({ message: 'Error interno del servidor'});
    }
};

export const registerCategoria = async(req,res) =>{
    try {
        const {nombre,descripcion, descuento } = req.body;
        const nuevaCategoria = await Categoria.create({nombre,descripcion,descuento});

        return res.status(201).json({nuevaCategoria});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al registrar la categoria' });
    }
};

export const deleteCategoria = async (req, res) =>{
    try {
        const categorias = await Categoria.findByPk(req.params.categoria_id);
        if(!categorias){
            return res.status(404).json({error:'Categoria no encontrada'});
        }
        await categorias.destroy();
        res.status(200).json({message: 'Categoria eliminada'});
    } catch (error) {
        console.log(error);
    }
};

export const updateCategoria = async(req, res)=>{
    try {
        const categorias = await Categoria.findByPk(req.params.categoria_id);
        if(!categorias){
            return res.status(404).json({ error: 'Categoria no encontrada'});
        }
        const {nombre,descripcion, descuento} = req.body;
        categorias.nombre = nombre;
        categorias.descripcion = descripcion;
        categorias.descuento = descuento;
        await categorias.save();
        res.status(200).json({message:'Categoria actualizada'});
    } catch (error) {
        console.log(error);
    }
};