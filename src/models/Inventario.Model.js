import { Model, DataTypes} from 'sequelize';
import Sucursal from './Sucursal.Model.js'
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de inventario
class Inventario extends Model {}

Inventario.init({
    inventario_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sucursal_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Sucursal,
            key: 'sucursal_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    modelName: 'Inventario',
    freezeTableName: true,
    tableName: 'inventario',
    timestamps: false,
    fecha_creacion: 'fecha_creacion', // Para evitar error de que no existe la columna
});

sequelize.sync().then(() => {
    console.log('Tabla de inventario creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de inventario');
});

export default Inventario;