import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('maya', 'root', 'LeninRonaldo717', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: false // Desactiva los logs de las consultas SQL
});

export default sequelize;