import Movimiento_Inventario from '../models/Movimiento_Inventario.Model.js';
import Tipo_Movimiento from '../models/Tipo_Movimiento.Model.js';
import { MovimientoInventarioRepository } from '../repositories/MovimientoInventario.Repository.js';

const repoMovimientoInventario = new MovimientoInventarioRepository(Movimiento_Inventario, Tipo_Movimiento);

export const getMovimientos = async (req, res) => {
    try {
        const movimientos = await repoMovimientoInventario.findAll();
        res.status(200).json(movimientos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los movimientos' });
    }
};

export const getEntradasBySucursal = async (req, res) => {
    const { sucursal_id } = req.params;

    try {
        const entradas = await repoMovimientoInventario.getEntradasBySucursal(sucursal_id);
        res.status(200).json(entradas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las entradas de la sucursal' });
    }
};

export const getSalidasBySucursal = async (req, res) => {
    const { sucursal_id } = req.params;

    try {
        const entradas = await repoMovimientoInventario.getSalidasBySucursal(sucursal_id);
        res.status(200).json(entradas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las entradas de la sucursal' });
    }
};

export const getMovimientosByProductInventory = async (req, res) => {
    try {
        const { producto_inventario_id } = req.params;
        const movimientos = await repoMovimientoInventario.findByProductInventoryId(producto_inventario_id);
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMovimientosByType = async (req, res) => {
    try {
        const { tipo_movimiento_id } = req.params;
        const movimientos = await repoMovimientoInventario.findByMovementType(tipo_movimiento_id);
        res.json(movimientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createMovimiento = async (req, res) => {
    try {
        const movementData = req.body;
        const newMovement = await repoMovimientoInventario.createMovement(movementData);
        res.status(201).json(newMovement);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al crear el movimiento',
            details: error.message 
        });
    }
};

export const createMultipleMovements = async (req, res) => {
    try {
        const movementsData = req.body;
        const createdMovements = await repoMovimientoInventario.bulkCreateMovements(movementsData);
        res.status(201).json({ 
            message: 'Movimientos creados correctamente', 
            data: createdMovements 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al crear múltiples movimientos',
            details: error.message 
        });
    }
};

export const getMovementsByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const movements = await repoMovimientoInventario.getMovementsByDateRange(startDate, endDate);
        res.json(movements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};