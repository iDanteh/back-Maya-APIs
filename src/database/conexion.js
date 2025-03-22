import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('maya', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
});

export default sequelize;