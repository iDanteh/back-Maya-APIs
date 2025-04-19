import { Op } from 'sequelize';

export class UsuarioRepository {
    constructor(Usuario, Sucursal) {
        this.Usuario = Usuario;
        this.Sucursal = Sucursal;
    }

    async findAll() {
        return await this.Usuario.findAll();
    }

    async findById(id) {
        return await this.Usuario.findByPk(id);
    }

    async findByEmail(email) {
        return await this.Usuario.findOne({ where: { email } });
    }

    async create(userData) {
        return await this.Usuario.create(userData);
    }

    async createAdmin(userData) {
        if (userData.rol === 'trabajador' && !userData.sucursal_id) {
            throw new Error('Los trabajadores deben tener una sucursal asignada');
        }
        return await this.Usuario.create(userData);
    }

    async update(id, userData) {
        const user = await this.Usuario.findByPk(id);
        if (!user) return null;
        return await user.update(userData);
    }

    async delete(id) {
        const user = await this.Usuario.findByPk(id);
        if (!user) return false;
        await user.destroy();
        return true;
    }

    async sucursalAccess(usuario, clave_acceso, sucursal_id) {
        return await this.Usuario.findOne({
            where: {
                usuario: usuario,
                clave_acceso: clave_acceso,
                sucursal_id: sucursal_id
            }
        });
    }

    async searchByName(name) {
        if (!name || name.trim() === '') {
            return [];
        }
        return await this.Usuario.findAll({
            where: {
                nombre: {
                    [Op.iLike]: `%${name}%`
                }
            }
        });
    }

    async getUserSucursal(usuario_id){
        const user = await this.Usuario.findByPk(usuario_id, {
            include: [{
                model: this.Sucursal,
                as: 'sucursal',
            }]
        });

        if (!user){
            throw new Error('Usuario no encontrado');
        }

        if (user.rol == 'administrador'){
            return await this.Sucursal.findAll();
        } else {
            if (!user.sucursal){
                throw new Error('Sucursal no encontrada');
            }
            return [user.sucursal];
        }
    }
}