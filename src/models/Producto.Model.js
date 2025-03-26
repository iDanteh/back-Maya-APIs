import { Model, DataTypes} from 'sequelize';
import Categoria from './Categoria.Model.js';
import Proveedor from './Proveedor.Model.js';
import sequelize from '../database/conexion.js';

// Clase para crear la tabla de productos
class Producto extends Model {}

Producto.init({
    codigo_barras: {
        type: DataTypes.STRING(50),
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    gramaje: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    precio_minimo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    precio_maximo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Categoria,
            key: 'categoria_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Proveedor,
            key: 'proveedor_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    presentacion: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    sustancia_activa: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
},
{
    sequelize,
    modelName: 'Producto',
    freezeTableName: true,
    tableName: 'producto',
    timestamps: false,
});

sequelize.sync().then(() => {
    console.log('Tabla de producto creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de producto');
});

export default Producto;