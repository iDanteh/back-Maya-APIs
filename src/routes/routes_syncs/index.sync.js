import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const __dirname = path.resolve();

fs.readdirSync(__dirname + '/src/routes/routes_syncs').forEach((file => {
    if (file.endsWith('.Routes.js')) {
        import(`./${file}`).then(routeModule => {
            router.use(routeModule.default);
        })
    }
}))

export default router;