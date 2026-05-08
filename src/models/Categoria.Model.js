import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de categorias
class Categoria extends Model {}

Categoria.init({
    categoria_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    descuento: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    dia_descuento: {
        type: DataTypes.ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', 'NINGUNO', 'FINES DE SEMANA', 'LUNES Y MARTES'),
        allowNull: true,
        defaultValue: 'NINGUNO'
    },
    impuesto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
},
{
    sequelize,
    modelName: 'Categoria',
    freezeTableName: true,
    tableName: 'categoria',
    timestamps: false,
}
);


export default Categoria;