import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';
import Tipo_Movimiento from './Tipo_Movimiento.Model.js';
import Producto_Inventario from './Producto_Inventario.Model.js';
import Transferencia from './Transferencia.Model.js';

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
    // Nullable a propósito, sin `references`: correlaciona las filas de
    // Salida/Entrada de una misma transferencia sin exigir un FK estricto
    // en la BD (ver migration_add_transferencia_id_movimiento.sql).
    transferencia_id: {
        type: DataTypes.UUID,
        allowNull: true,
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
Movimiento_Inventario.belongsTo(Producto_Inventario, { foreignKey: 'producto_inventario_id' });
Movimiento_Inventario.belongsTo(Tipo_Movimiento, { foreignKey: 'tipo_movimiento_id' });
// constraints: false — el diseño (ver comentario en la columna arriba y
// migration_add_transferencia_id_movimiento.sql) es a propósito sin FK física.
// Sin esto, sync({alter:true}) intenta crear el FK real y choca con la columna
// creada manualmente.
Movimiento_Inventario.belongsTo(Transferencia, { foreignKey: 'transferencia_id', constraints: false });


export default Movimiento_Inventario;