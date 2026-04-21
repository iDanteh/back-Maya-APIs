import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/conexion.js';
import Producto from './Producto.Model.js';

class Promocion extends Model {}

Promocion.init({
    promocion_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo_barras: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    tipo: {
        type: DataTypes.ENUM('precio_multiple'),
        allowNull: false,
        defaultValue: 'precio_multiple',
    },
    cantidad_minima: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio_promocional: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    dias_disponible: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('dias_disponible');
            if (!raw) return [];
            if (Array.isArray(raw)) return raw;
            try { return JSON.parse(raw); } catch { return []; }
        },
        set(val) {
            if (Array.isArray(val)) {
                this.setDataValue('dias_disponible', JSON.stringify(val));
            } else if (typeof val === 'string' && val.trim()) {
                this.setDataValue('dias_disponible', val);
            } else {
                this.setDataValue('dias_disponible', '[]');
            }
        },
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize,
    modelName: 'Promocion',
    freezeTableName: true,
    tableName: 'promocion',
    timestamps: false,
});

Promocion.belongsTo(Producto, { foreignKey: 'codigo_barras', as: 'producto' });
Producto.hasMany(Promocion, { foreignKey: 'codigo_barras', as: 'promociones' });

Promocion.sync({ alter: true }).then(() => {
    console.log('Tabla de promocion sincronizada correctamente');
}).catch((error) => {
    console.log('Error al sincronizar la tabla de promocion:', error.message);
});

export default Promocion;
