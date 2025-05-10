import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('maya', 'root', 'LeninRonaldo717', {/**vasquez18tec */
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    timezone: '-06:00',
    logging: false // Desactiva los logs de las consultas SQL
});

export default sequelize;