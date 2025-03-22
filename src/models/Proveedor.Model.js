import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de proveedores
class Proveedor extends Model {}

Proveedor.init({
    proveedor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    contacto: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
},
{
    sequelize,
    modelName: 'Proovedor',
    freezeTableName: true,
    tableName: 'proveedor',
    timestamps: false,
});

sequelize.sync().then(() => {
    console.log('Tabla de proveedor creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de proveedor');
});

export default Proveedor;