import express from 'express';
import Usuario from '../../models/Usuario.Model';

const router = express.Router();

// 1. Recibir datos desde SQLite (Electron) hacia PostgreSQL
router.post('/usuarios/from-local', async (req, res) => {
    try {
        const usuarios = req.body;

        for (const usr of usuarios) {
            await Usuario.findOrCreate({
                where: { usuario_id: usr.usuario_id },
                defaults: {
                    nombre: usr.nombre,
                    apellido: usr.apellido,
                    telefono: usr.telefono,
                    email: usr.email,
                    rol: usr.rol,
                    turno: usr.turno,
                    usuario: usr.usuario,
                    clave_acceso: usr.clave_acceso,
                    sucursal_id: usr.sucursal_id,
                }
            });
        }

        res.json({ message: '✅ usuarios sincronizadas desde cliente.' });
    } catch (err) {
        console.error('❌ Error en /from-local:', err);
        res.status(500).json({ error: 'Error al sincronizar usuarios.' });
    }
});

// 2. Enviar datos desde PostgreSQL hacia SQLite
router.get('/usuarios/to-local', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (err) {
        console.error('❌ Error en /to-local:', err);
        res.status(500).json({ error: 'Error al enviar usuarios.' });
    }
});

export default router;