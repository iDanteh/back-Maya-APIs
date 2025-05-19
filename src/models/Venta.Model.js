import { Model, DataTypes} from 'sequelize';
import sequelize from '../database/conexion.js';
import Sucursal from './Sucursal.Model.js';
import Usuario from './Usuario.Model.js';

class Venta extends Model{}

Venta.init({
    venta_id:{
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    sucursal_id:{
        type: DataTypes.STRING(10),
        allowNull: false,
        references:{
            model:Sucursal,
            key:'sucursal_id',
        },
        onDelete: 'CASCADE',
        onUpdate:'CASCADE',
    },
    usuario_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model:Usuario,
            key:'usuario_id',
        },
        onDelete: 'CASCADE',
        onUpdate:'CASCADE',
    },
    fecha_venta:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total_recibido: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    numero_factura: {
        type: DataTypes.STRING(50),
        unique: true,
    },
    anulada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
{
    sequelize,
    modelName: 'Venta',
    freezeTableName: true,
    tableName: 'venta',
    timestamps: false,
});

Venta.associate = (models) => {
    Venta.hasMany(models.Detalle_Venta, {
        foreignKey: 'venta_id',
        as: 'detalles'
    });
};

Venta.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    targetKey: 'usuario_id',
})

Venta.belongsTo(Sucursal, {
    foreignKey: 'sucursal_id',
    targetKey: 'sucursal_id',
})

sequelize.sync().then(() => {
    console.log('Tabla de venta creada exitosamente');
}).catch(error => {
    console.log('Error al crear la tabla de venta');
});

export default Venta;