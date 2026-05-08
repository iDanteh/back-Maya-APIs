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

export default Doctores_Cedula;