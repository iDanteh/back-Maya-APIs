import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';

class Tipo_Movimiento extends Model{}

Tipo_Movimiento.init({
    tipo_movimiento_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    descripcion:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    factor: {
        type: DataTypes.ENUM('Entrada', 'Salida', 'Venta', 'Anulación de venta', 'Actualizacion manual del inventario','Caducidad'),
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


export default Tipo_Movimiento;