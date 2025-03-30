import Tipo_Movimiento from '../models/Tipo_Movimiento.Model.js';
import { tipo_movimientoRepository } from '../repositories/Tipo_Movimiento.repository.js';

const repoTipoMovimiento = new tipo_movimientoRepository(Tipo_Movimiento);

export const getTiposMovimiento = async (req, res) => {
    try {
        const tipos = await repoTipoMovimiento.findAll();
        res.status(200).json(tipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los tipos de movimiento' });
    }
};

export const getTipoMovimientoById = async (req, res) => {
    try {
        const { tipo_movimiento_id } = req.params;
        const tipo = await repoTipoMovimiento.findById(tipo_movimiento_id);
        
        if (!tipo) {
            return res.status(404).json({ message: 'Tipo de movimiento no encontrado' });
        }
        
        res.json(tipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTiposByFactor = async (req, res) => {
    try {
        const { factor } = req.params;
        const tipos = await repoTipoMovimiento.findByFactor(factor);
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const registerTipoMovimiento = async (req, res) => {
    try {
        const tipoData = req.body;
        const newTipo = await repoTipoMovimiento.createTipoMovimiento(tipoData);
        res.status(201).json(newTipo);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al registrar el tipo de movimiento',
            details: error.message 
        });
    }
};

export const updateTipoMovimiento = async (req, res) => {
    try {
        const { tipo_movimiento_id } = req.params;
        const updateData = req.body;
        
        const updatedTipo = await repoTipoMovimiento.updateTipoMovimiento(tipo_movimiento_id, updateData);
        
        if (!updatedTipo) {
            return res.status(404).json({ message: 'Tipo de movimiento no encontrado' });
        }
        
        res.json(updatedTipo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTipoMovimiento = async (req, res) => {
    try {
        const { tipo_movimiento_id } = req.params;
        const success = await repoTipoMovimiento.deleteTipoMovimiento(tipo_movimiento_id);
        
        if (!success) {
            return res.status(404).json({ message: 'Tipo de movimiento no encontrado' });
        }
        
        res.json({ message: 'Tipo de movimiento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};