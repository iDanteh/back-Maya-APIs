import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';
import Tipo_Movimiento from './Tipo_Movimiento.Model.js';
import Producto_Inventario from './Producto_Inventario.Model.js';

class Movimiento_Inventario extends Model{}

Movimiento_Inventario.init({
    movimiento_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    producto_inventario_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model:Producto_Inventario,
            key:'producto_inventario_id',
        },
        onDelete: 'SET NULL',
        onUpdate:'CASCADE',
    },
    tipo_movimiento_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model:Tipo_Movimiento,
            key:'tipo_movimiento_id',
        },
        onDelete: 'CASCADE',
        onUpdate:'CASCADE',
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fecha_movimiento:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    referencia:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    observaciones:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
},
{
    sequelize,
    modelName: 'Movimiento_Inventario',
    freezeTableName: true,
    tableName: 'movimiento_inventario',
    timestamps: false,
});

// Relaciones para poder hacer include correctamente
Movimiento_Inventario.belongsTo(Producto_Inventario, { foreignKey: 'producto_inventario_id', onDelete: 'SET NULL' });
Movimiento_Inventario.belongsTo(Tipo_Movimiento, { foreignKey: 'tipo_movimiento_id' });

sequelize.sync().then(() => {
    console.log('Tabla de movimiento_inventario creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de movimiento_inventario');
});

export default Movimiento_Inventario;