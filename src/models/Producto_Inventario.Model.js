import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';
import Inventario from './Inventario.Model.js';
import Producto from './Producto.Model.js'
import Sucursal from '../models/Sucursal.Model.js';

class Producto_Inventario extends Model{}

Producto_Inventario.init({
    producto_inventario_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo_barras: {
        type: DataTypes.STRING(150),
        allowNull: false,
        references:{
            model:Producto,
            key:'codigo_barras',
        },
        onDelete:'RESTRICT', // BD: ON DELETE RESTRICT — no borrar producto si tiene inventario
        onUpdate:'CASCADE',
    },
    sucursal_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Sucursal,
            key: 'sucursal_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    inventario_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model:Inventario,
            key:'inventario_id',
        },
        onDelete: 'CASCADE',
        onUpdate:'CASCADE',
    },
    existencias:{
        type: DataTypes.INTEGER,
        defaultValue: 0,   
    },
    fecha_ultima_actualizacion:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    lote: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    fecha_caducidad: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // uq_llave_activo NO se declara aca a proposito: es una columna GENERATED
    // ALWAYS ... VIRTUAL real en MySQL (ver maya_v29.sql), con su propio UNIQUE
    // index. Declararla como DataTypes.VIRTUAL de Sequelize choca con eso durante
    // sync({alter:true}) porque Sequelize la trata como atributo sin columna real.
    // La columna y el indice siguen existiendo y aplicandose en la BD sin que el
    // modelo la declare.
},
{
    sequelize,
    modelName: 'Producto_Inventario',
    freezeTableName: true,
    tableName: 'producto_inventario',
    timestamps: false,
});

Producto_Inventario.belongsTo(Producto, {
    foreignKey: 'codigo_barras',
    targetKey: 'codigo_barras',
});


export default Producto_Inventario;