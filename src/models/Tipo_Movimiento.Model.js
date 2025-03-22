import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';

class Tipo_Movimiento extends Model{}

Tipo_Movimiento.init({
    tipo_movimiento_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    factor: {
        type: DataTypes.ENUM('Entrada', 'Salida', 'Venta'),
        allowNull: false,
    },
},
{
    sequelize,
    modelName: 'Tipo_Movimiento',
    freezeTableName: true,
    tableName: 'tipo_movimiento',
    timestamps: false,
});

sequelize.sync().then(() => {
    console.log('Tabla de tipo_movimiento creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de tipo_movimiento');
});

export default Tipo_Movimiento;