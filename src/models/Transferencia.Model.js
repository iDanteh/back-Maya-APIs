import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/conexion.js';
import Usuario from './Usuario.Model.js';
import Sucursal from './Sucursal.Model.js';

class Transferencia extends Model {}

Transferencia.init({
    transferencia_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'usuario_id',
        },
        onUpdate: 'CASCADE',
    },
    sucursal_origen_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Sucursal,
            key: 'sucursal_id',
        },
        onUpdate: 'CASCADE',
    },
    sucursal_destino_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: Sucursal,
            key: 'sucursal_id',
        },
        onUpdate: 'CASCADE',
    },
    // Sesión 1-3 (Opción A: transferencia instantánea) solo usa estos dos
    // valores. PENDIENTE/ENVIADA/RECIBIDA quedan fuera hasta que se decida
    // construir el flujo asíncrono de confirmación (Opción B).
    estado: {
        type: DataTypes.ENUM('EXITOSA', 'ERROR'),
        allowNull: false,
    },
    error_mensaje: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    fecha_transferencia: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    modelName: 'Transferencia',
    freezeTableName: true,
    tableName: 'transferencia',
    timestamps: false,
});

// Sin onDelete: por defecto InnoDB usa RESTRICT. A diferencia de Venta
// (que usa CASCADE en usuario_id/sucursal_id), una tabla de auditoría no
// debe perder su historial si se borra el usuario o la sucursal.
Transferencia.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Transferencia.belongsTo(Sucursal, { foreignKey: 'sucursal_origen_id', as: 'sucursalOrigen' });
Transferencia.belongsTo(Sucursal, { foreignKey: 'sucursal_destino_id', as: 'sucursalDestino' });

export default Transferencia;
