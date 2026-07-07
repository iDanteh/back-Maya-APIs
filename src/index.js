import express from 'express';
import { PORT } from './config.js'; // Importar el puerto desde el archivo config.js
import sequelize from './database/conexion.js'; // Importar la conexión a la base de datos
import routes from './routes/Routesindex.js'; // Importar todas las rutas desde el archivo index.js
import morgan from 'morgan'; // Importar morgan para ver las peticiones en consola
import cors from 'cors';
import 'dotenv/config';
import './models/initModels.js';
import errorHandler from './middlewares/errorHandler.js'; // Importar el middleware de manejo de errores

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'ngrok-skip-browser-warning'],
    preflightContinue: false,
}));
// Hora generada (ajustada para forzar asignación de zona horaria de méxico)
console.log(new Date().toString());

app.options('*', cors());

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Health check — sin consulta a BD, responde siempre en <10ms.
// Registrado en ambas rutas:
//   /health        → acceso directo al servidor (local dev, herramientas de monitoreo)
//   /api/v1/health → acceso desde el frontend (VITE_API_URL ya incluye /api/v1 como prefijo,
//                    por lo que el ping construye VITE_API_URL + '/health' = .../api/v1/health)
app.get('/health',        (_req, res) => res.status(200).json({ ok: true }));
app.get('/api/v1/health', (_req, res) => res.status(200).json({ ok: true }));

app.use(routes);

// Asignación del puerto que va a escuchar el servidor.
// keepAliveTimeout: mantiene la conexión TCP abierta 30s para reutilizarla.
// headersTimeout debe ser siempre mayor que keepAliveTimeout para evitar race condition.
const server = app.listen(PORT);
server.keepAliveTimeout = 30_000;
server.headersTimeout = 35_000;
console.log('Escuchando en el puerto', PORT);

// Prueba para la conexión con la base de datos workbench
(async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa');

        // sync centralizado — crea tablas que no existen, nunca modifica las existentes.
        // NO usar alter:true en producción: causaría locks en tablas grandes y podría
        // intentar cambiar constraints que la BD tiene correctamente definidos en el dump.
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados');
    } catch (error) {
        console.error('Error al conectarse a la base de datos:', error);
    }
})();

app.use(errorHandler); // Middleware de manejo de errores