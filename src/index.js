import express from 'express';
import { PORT } from './config.js'; // Importar el puerto desde el archivo config.js
import sequelize from './database/conexion.js'; // Importar la conexión a la base de datos
import routes from './routes/index.js'; // Importar todas las rutas desde el archivo index.js
import morgan from 'morgan'; // Importar morgan para ver las peticiones en consola
import cors from 'cors'

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
}));

app.options('*', cors());

app.use(express.urlencoded({ extended: true })); 
app.use(morgan('dev'));
app.use(express.json()); 
app.use(routes);

// Asignación del puerto que va a escuchar el servidor
app.listen(PORT);
console.log('Escuchando en el puerto', PORT);

// Prueba para la conexión con la base de datos workbench
(async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa');
    } catch (error) {
        console.error('Error al conectarse a la base de datos:', error);
    }
})();