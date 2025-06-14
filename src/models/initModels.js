import Producto from "./Producto.Model.js";
import Categoria from "./Categoria.Model.js";

// Asociaciones
Producto.belongsTo(Categoria, {
    foreignKey: 'categoria_id',
    as: 'categoria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Categoria.hasMany(Producto, {
    foreignKey: 'categoria_id',
    as: 'productos',
});

export {
    Producto,
    Categoria,
};