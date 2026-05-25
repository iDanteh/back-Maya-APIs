import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: Number(process.env.DB_PORT) || 3306,
        timezone: '-06:00',
        logging: false,
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        },
        // Pool de conexiones: reutiliza conexiones TCP en lugar de abrir una nueva por query.
        // En máquinas lentas esto elimina el overhead de handshake (~500ms) en cada petición.
        pool: {
            max: 10,       // máximo de conexiones simultáneas
            min: 2,        // conexiones siempre abiertas (warm pool)
            idle: 30_000,  // cierra una conexión si lleva 30s sin usarse
            acquire: 30_000, // timeout esperando una conexión libre del pool
            evict: 15_000,   // intervalo para limpiar conexiones vencidas
        },
        dialectOptions: {
            // Mantiene la conexión TCP viva entre queries para evitar reconexión.
            enableKeepAlive: true,
            keepAliveInitialDelaySeconds: 30,
        },
    }
);

export default sequelize;