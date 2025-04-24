import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';
import Venta from './Venta.Model.js';
import Producto from './Producto.Model.js'
import Usuario from '../models/Usuario.Model.js';
import Sucursal from '../models/Sucursal.Model.js';

class Detalle_Venta extends Model{}

Detalle_Venta.init({
    detalle_venta_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    venta_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references:{
            model:Venta,
            key:'venta_id',
        },
        onDelete: 'CASCADE',
        onUpdate:'CASCADE',
    },
    codigo_barras: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references:{
            model:Producto,
            key:'codigo_barras',
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'usuario_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    descuento: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    }
}, 
{
    sequelize,
    modelName: 'Detalle_Venta',
    freezeTableName: true,
    tableName: 'detalle_venta',
    timestamps: false,
});

Detalle_Venta.belongsTo(Sucursal,{
    foreignKey: 'sucursal_id',
    targetKey: 'sucursal_id'
});

Detalle_Venta.belongsTo(Venta,{
    foreignKey: 'venta_id',
    targetKey: 'venta_id'
});

Detalle_Venta.belongsTo(Producto,{
    foreignKey: 'codigo_barras',
    targetKey: 'codigo_barras'
});

Detalle_Venta.belongsTo(Usuario,{
    foreignKey: 'usuario_id',
    targetKey: 'usuario_id'
});

sequelize.sync().then(() => {
    console.log('Tabla de detalle_venta creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de detalle_venta');
});

export default Detalle_Venta;