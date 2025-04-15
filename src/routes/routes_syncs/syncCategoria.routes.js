import express from 'express';
import Categoria from '../../models/Categoria.Model';

const router = express.Router();

// 1. Recibir datos desde SQLite (Electron) hacia PostgreSQL
router.post('/from-local', async (req, res) => {
    try {
        const categorias = req.body;

        for (const cat of categorias) {
            await Categoria.findOrCreate({
                where: { categoria_id: cat.categoria_id },
                defaults: {
                    nombre: cat.nombre,
                    descripcion: cat.descripcion,
                    descuento: cat.descuento,
                    dia_descuento: cat.dia_descuento
                }
            });
        }

        res.json({ message: '✅ Categorías sincronizadas desde cliente.' });
    } catch (err) {
        console.error('❌ Error en /from-local:', err);
        res.status(500).json({ error: 'Error al sincronizar categorías.' });
    }
});

// 2. Enviar datos desde PostgreSQL hacia SQLite
router.get('/to-local', async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (err) {
        console.error('❌ Error en /to-local:', err);
        res.status(500).json({ error: 'Error al enviar categorías.' });
    }
});

export default router;