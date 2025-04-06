import { Op } from 'sequelize';

export class UsuarioRepository {
    constructor(model) {
        this.model = model;
    }

    async findAll() {
        return await this.model.findAll();
    }

    async findById(id) {
        return await this.model.findByPk(id);
    }

    async findByEmail(email) {
        return await this.model.findOne({ where: { email } });
    }

    async create(userData) {
        return await this.model.create(userData);
    }

    async createAdmin(userData) {
        return await this.model.create(userData);
    }

    async update(id, userData) {
        const user = await this.model.findByPk(id);
        if (!user) return null;
        return await user.update(userData);
    }

    async delete(id) {
        const user = await this.model.findByPk(id);
        if (!user) return false;
        await user.destroy();
        return true;
    }

    async sucursalAccess(usuario, clave_acceso, sucursal_id) {
        return await this.model.findOne({
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
        return await this.model.findAll({
            where: {
                nombre: {
                    [Op.iLike]: `%${name}%`
                }
            }
        });
    }
}