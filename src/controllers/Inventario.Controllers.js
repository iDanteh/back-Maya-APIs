import Inventario from '../models/Inventario.Model.js';

export const getInventarios = async (req, res) => {
    try {
        const inventarios = await Inventario.findAll();
        res.status(200).json(inventarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los inventarios' });
    }
}