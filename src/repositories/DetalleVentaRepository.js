import Venta from '../models/Venta.Model.js';
import Producto from '../models/Producto.Model.js';
import Usuario from '../models/Usuario.Model.js';
import Sucursal from '../models/Sucursal.Model.js';
import Categoria from '../models/Categoria.Model.js';
import Producto_Inventario from '../models/Producto_Inventario.Model.js';
import { where } from 'sequelize';

export class detalle_VentaRepository {
    constructor (detalleVentaModel) {
        this.detalleVentaModel = detalleVentaModel;
    }

    // Función para obtener el detalle de la venta que se realizó
    // para hacer la impresión en el ticket correspondiente
    async findVentaById(venta_id) {
        return await this.detalleVentaModel.findAll({
            where: { venta_id },
            include: [
                {
                    model: Sucursal,
                    attributes: { 
                        exclude: [
                            'fecha_creacion',
                            'contraseña_sucursal'
                        ]
                    }
                },
                {
                    model: Venta,
                    attributes: { exclude: ['anulada']}
                },
                {
                    model: Producto,
                    attributes: { 
                        exclude: [
                            'precio_minimo',
                            'precio_maximo',
                            'proveedor_id',
                            'presentacion',
                            'sustancia_activa'
                        ]
                    },
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria'
                        }
                    ]
                },
                {
                    model: Usuario
                },
                {
                    model: Producto_Inventario,
                }
            ]
        })
    }
};