import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const __dirname = path.resolve(); // Ruta absoluta del proyecto

// Importar todas las rutas de la carpeta src/routes 
fs.readdirSync(__dirname + '/src/routes').forEach((file => {
    if (file.endsWith('.Routes.js')) {
        import(`./${file}`).then(routeModule => {
            router.use(routeModule.default);
        });
    }
}));

export default router;