import Tipo_Movimiento from '../models/Tipo_Movimiento.Model.js';

export const getTipoMovimiento = async (req, res) => {
    try {
        const tiposMovimientos = await Tipo_Movimiento.findAll();
        res.status(200).json(tiposMovimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los tipos de movimientos existentes' });
    }
};

export const getTipoMovimientoById = async (req, res) =>{
    try {
        const tipoMovimiento = await Tipo_Movimiento.findByPk(req.params.tipo_movimiento_id);

        if(!tipoMovimiento){
            res.status(404).json({ error: 'tipo de movimiento no encontrado'});
        }
        res.status(500).json({error: 'Error al obtener el tipo de movimiento'});
    } catch (error) {
        res.status(500).json({error:'Error al obtener el tipo de movimiento'});
    }
};

export const registerTipoMovimiento = async(req,res) =>{
    try {
        const {descripcion,factor} = req.body;
        const nuevoTipoMovimiento = await Categoria.create({descripcion,factor});

        return res.status(201).json({nuevoTipoMovimiento: nuevoTipoMovimiento});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error al registrar el tipo de movimiento' });
    }
};

export const deleteTipoMovimiento = async (req, res) =>{
    try {
        const tiposMovimientos = await Tipo_Movimiento.findByPk(req.params.tipo_movimiento_id);
        if(!tiposMovimientos){
            return res.status(404).json({error:'tipo de movimiento no encontrado'});
        }
        await tiposMovimientos.destroy();
        res.status(200).json({message: 'Tipo de movimiento eliminado'});
    } catch (error) {
        console.log(error);
    }
};

export const updateTipoMovimiento = async(req, res)=>{
    try {
        const tiposMovimientos = await Tipo_Movimiento.findByPk(req.params.tipo_movimiento_id);
        if(!tiposMovimientos){
            return res.status(404).json({ error: 'Tipo de movimiento no encontrado'});
        }
        const {descripcion,factor} = req.body;
        tiposMovimientos.descripcion = descripcion;
        tiposMovimientos.factor = factor;
        await tiposMovimientos.save();
        res.status(200).json({message:'Tipo movimiento actualizado'});
    } catch (error) {
        console.log(error);
    }
};