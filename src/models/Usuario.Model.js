import { Model, DataTypes} from 'sequelize';
import Sucursal from './Sucursal.Model.js';
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de categorias
class Categoria extends Model {}

Categoria.init({
    usuario_id:{
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
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    apellido: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    rol: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isIn: [['administrador', 'trabajador']]
        },
    },
    turno: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    fecha_ingreso: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    modelName: 'Usuario',
    freezeTableName: true,
    tableName: 'usuario',
    timestamps: false,
    fecha_ingreso: 'fecha_ingreso', // Para evitar error de que no existe la columna
});

sequelize.sync().then(() => {
    console.log('Tabla de usuario creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de usuario');
});

export default Categoria;