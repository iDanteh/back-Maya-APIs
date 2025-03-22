import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';
import Inventario from './Inventario.Model.js';
import Producto from './Producto.Model.js'

class Producto_Inventario extends Model{}

Producto_Inventario.init({
    producto_inventario_id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo_barras: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        references:{
            model:Producto,
            key:'codigo_barras',
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE',
    },
    inventario_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique:true,
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
},
{
    sequelize,
    modelName: 'Producto_Inventario',
    freezeTableName: true,
    tableName: 'producto_inventario',
    timestamps: false,
});

sequelize.sync().then(() => {
    console.log('Tabla de producto_inventario creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de producto_inventario');
});

export default Producto_Inventario;