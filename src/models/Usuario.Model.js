import { Model, DataTypes} from 'sequelize';
import Sucursal from './Sucursal.Model.js';
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de Usuarios
class Usuario extends Model {}

Usuario.init({
    usuario_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    apellido: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    rol: {
        type: DataTypes.ENUM('administrador', 'trabajador'),
        allowNull: false,
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
    usuario: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    clave_acceso: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    sucursal_id: {
        type: DataTypes.STRING(10),
        allowNull: true,
        references: {
            model: Sucursal,
            key: 'sucursal_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
},
{
    sequelize,
    modelName: 'Usuario',
    freezeTableName: true,
    tableName: 'usuario',
    timestamps: false,
    fecha_ingreso: 'fecha_ingreso',
    defaultScope: {
        where: { is_active: true }
    }
});

Usuario.belongsTo(Sucursal, {
    foreignKey: 'sucursal_id',
    as: 'sucursal'
});

// Para administradores que pueden acceder a todas las sucursales
Usuario.prototype.getSucursales = async function() {
    if (this.rol === 'administrador') {
        return await Sucursal.findAll();
    } else {
        return await this.getSucursal();
    }
};

sequelize.sync().then(() => {
    console.log('Tabla de usuario creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de usuario');
});

export default Usuario;