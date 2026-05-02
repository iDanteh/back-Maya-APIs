import Promocion from '../models/Promocion.Model.js';
import Producto from '../models/Producto.Model.js';

const productoAttributes = ['descripcion', 'precio_maximo', 'precio_minimo'];

export const getPromociones = async (req, res) => {
    try {
        const promociones = await Promocion.findAll({
            include: [{
                model: Producto.unscoped(),
                as: 'producto',
                attributes: productoAttributes,
                required: false,
            }],
            order: [['promocion_id', 'DESC']],
        });
        res.status(200).json(promociones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las promociones' });
    }
};

export const getPromocionById = async (req, res) => {
    try {
        const promocion = await Promocion.findByPk(req.params.promocion_id, {
            include: [{
                model: Producto.unscoped(),
                as: 'producto',
                attributes: productoAttributes,
                required: false,
            }],
        });
        if (!promocion) return res.status(404).json({ error: 'Promoción no encontrada' });
        res.status(200).json(promocion);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la promoción' });
    }
};

export const getPromocionByBarcode = async (req, res) => {
    try {
        const promociones = await Promocion.findAll({
            where: { codigo_barras: req.params.codigo_barras, activo: 1 },
        });
        res.status(200).json(promociones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la promoción' });
    }
};

export const registerPromocion = async (req, res) => {
    try {
        const {
            codigo_barras, nombre, tipo,
            cantidad_minima, precio_promocional,
            dias_disponible, fecha_inicio, fecha_fin, activo,
        } = req.body;

        if (!codigo_barras || !nombre || !cantidad_minima || !precio_promocional) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const nuevaPromocion = await Promocion.create({
            codigo_barras,
            nombre,
            tipo: tipo || 'precio_multiple',
            cantidad_minima: parseInt(cantidad_minima),
            precio_promocional: parseFloat(precio_promocional),
            dias_disponible: dias_disponible || [],
            fecha_inicio: fecha_inicio || null,
            fecha_fin: fecha_fin || null,
            activo: activo !== undefined ? activo : true,
        });

        res.status(201).json({ nuevaPromocion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la promoción' });
    }
};

export const updatePromocion = async (req, res) => {
    try {
        const promocion = await Promocion.findByPk(req.params.promocion_id);
        if (!promocion) return res.status(404).json({ error: 'Promoción no encontrada' });

        const {
            codigo_barras, nombre, tipo,
            cantidad_minima, precio_promocional,
            dias_disponible, fecha_inicio, fecha_fin, activo,
        } = req.body;

        promocion.codigo_barras = codigo_barras;
        promocion.nombre = nombre;
        promocion.tipo = tipo || 'precio_multiple';
        promocion.cantidad_minima = parseInt(cantidad_minima);
        promocion.precio_promocional = parseFloat(precio_promocional);
        promocion.dias_disponible = dias_disponible || [];
        promocion.fecha_inicio = fecha_inicio || null;
        promocion.fecha_fin = fecha_fin || null;
        promocion.activo = activo !== undefined ? activo : true;

        await promocion.save();
        res.status(200).json({ message: 'Promoción actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la promoción' });
    }
};

export const deletePromocion = async (req, res) => {
    try {
        const promocion = await Promocion.findByPk(req.params.promocion_id);
        if (!promocion) return res.status(404).json({ error: 'Promoción no encontrada' });
        await promocion.destroy();
        res.status(200).json({ message: 'Promoción eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la promoción' });
    }
};
