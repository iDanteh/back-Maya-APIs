import { Op } from 'sequelize';

export class DoctoresRepository {
    constructor(DoctoresModel) {
        this.Doctores = DoctoresModel;
    }

    async createDoctor (doctorData) {
        try {
            if (!doctorData.cedula || !doctorData.doctor) {
                throw new Error('Cedula y Nombre del doctor son requeridos');
            }
            const existingDoctor = await this.Doctores.findOne({
                where: {
                    cedula: doctorData.cedula
                }
            });
            if (existingDoctor) {
                throw new Error('Doctor with this cedula already exists');
            }
            return await this.Doctores.create(doctorData);
        } catch (error) {
            console.log('Error al crear doctor con cedula', error);
            throw error;
        }
    }

    async findAllDoctors({ limit, offset } = {}) {
        try {
            const opts = { order: [['doctor', 'ASC']] };
            if (limit !== undefined) opts.limit = limit;
            if (offset !== undefined) opts.offset = offset;
            return await this.Doctores.findAll(opts);
        } catch (error) {
            console.log('Error al obtener todos los doctores', error);
            return [];
        }
    }

    async findDoctorById(cedula_id) {
        try {
            return await this.Doctores.findByPk(cedula_id);
        } catch (error) {
            console.log('Error al buscar doctor por ID', error);
            return null;
        }
    }
};