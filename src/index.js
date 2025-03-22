import express from 'express';
import { PORT } from './config.js';
import sequelize from './database/conexion.js';
import categorias from './routes/Categoria.Routes.js';
import morgan from 'morgan';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(categorias);

// Asignación del puerto que va a escuchar el servidor
app.listen(PORT);
console.log('Escuchando en el puerto', PORT);

// Prueba para la conexión con la base de datos workbench
async function tectConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa')
    } catch (error) {
        console.log('Error al conectarse a la base de datos', error)
    }
}

tectConnection();