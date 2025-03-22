import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de sucursales
class Sucursal extends Model {}

Sucursal.init({
    sucursal_id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    modelName: 'Sucursal',
    freezeTableName: true,
    tableName: 'sucursal',
    timestamps: false,
    fecha_creacion: 'fecha_creacion', // Para evitar error de que no existe la columna
});

sequelize.sync().then(() => {
    console.log('Tabla de sucursal creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de sucursal');
});

export default Sucursal;