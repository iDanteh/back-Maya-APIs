import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/conexion.js';

class Doctores_Cedula extends Model {};

Doctores_Cedula.init({
    cedula_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cedula: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    doctor: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
},
{
    sequelize,
    modelName: 'Doctores_Cedula',
    freezeTableName: true,
    tableName: 'doctores_cedula',
    timestamps: false,
});

sequelize.sync().then(() => {
    console.log('Tabla Dcoctores_Cedula creada exitosamente');
}).catch((error) => {
    console.error('Error al crear la tabla Doctores_Cedula:', error);
});

export default Doctores_Cedula;