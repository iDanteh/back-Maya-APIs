import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { isTokenBlacklisted } from './tokenBlacklist.js'

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token requerido' });

    const token = authHeader.split(' ')[1]; 
    if (!token) return res.status(403).json({ error: 'Token inválido' });

    if (isTokenBlacklisted(token)) {
        return res.status(401).json({ error: 'Token inválido (cerró sesión)' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token expirado o inválido' });

        req.user = decoded;
        next();
  });
};