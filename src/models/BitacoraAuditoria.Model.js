import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/conexion.js';
import Usuario from './Usuario.Model.js';

class BitacoraAuditoria extends Model {}

BitacoraAuditoria.init({
    bitacora_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    entidad: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    // String y no INTEGER/UUID: distintas entidades usan distintos tipos de id
    // (producto_inventario_id es INTEGER, transferencia_id es UUID). Puede quedar
    // NULL cuando la operación falló antes de crear/identificar algo (ej. alta rechazada).
    entidad_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    accion: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    // Nullable y sin FK a propósito, mismo criterio que transferencia_id en
    // movimiento_inventario: la bitácora tiene que poder registrar hasta un
    // intento sin usuario identificado (request mal formado), sin que una
    // constraint le impida dejar rastro.
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    datos_antes: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    datos_despues: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    resultado: {
        type: DataTypes.ENUM('EXITO', 'ERROR'),
        allowNull: false,
    },
    mensaje_error: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
{
    sequelize,
    modelName: 'BitacoraAuditoria',
    freezeTableName: true,
    tableName: 'bitacora_auditoria',
    timestamps: false,
});

// Sin constraints: mismo criterio que la columna usuario_id arriba, la bitácora
// no puede depender de integridad referencial para poder registrar un intento
// sin usuario identificado. El .unscoped() para mostrar auditoría de usuarios
// desactivados se aplica al hacer el include (ver BitacoraAuditoria.Repository.js),
// no acá — misma convención que Transferencia.Model.js.
BitacoraAuditoria.belongsTo(Usuario, { foreignKey: 'usuario_id', constraints: false });

export default BitacoraAuditoria;
