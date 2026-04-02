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
    }
);

export default sequelize;