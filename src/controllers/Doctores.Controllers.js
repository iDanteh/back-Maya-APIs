import Doctores from '../models/Doctores.Model.js';
import { DoctoresRepository } from '../repositories/DoctoresRepository.js';
import { getPagination } from '../utils/pagination.js';

const doctoresRepo = new DoctoresRepository(Doctores);

export const getDoctors = async (req, res) => {
    try {
        const { limit, offset } = getPagination(req.query);
        const doctors = await doctoresRepo.findAllDoctors({ limit, offset });
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

export const getDoctorById = async (req, res) => {
    try {
        const doctor = await doctoresRepo.findDoctorById(req.params.cedula_id);

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor no encontrado' });
        }

        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el doctor' });
    }
};

export const createDoctor = async (req, res) => {
    try {
        const doctorData = req.body;
        const newDoctor = await doctoresRepo.createDoctor(doctorData);

        if (!newDoctor) {
            return res.status(400).json({ error: 'Error al crear el doctor' });
        }

        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};