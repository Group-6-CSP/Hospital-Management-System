import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';
const DOCTORS_URL = `${API_BASE}/api/doctors`;
const REPORTS_URL = `${API_BASE}/api/reports`;

export const createDoctor = async (name, specialization, contact, email, availability) => {
    try {
        const response = await axios.post(`${DOCTORS_URL}`, {
            name,
            specialization,
            contact,
            email: email || '',
            availability: availability || ''
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create doctor' };
    }
};

export const getAllDoctors = async () => {
    try {
        const response = await axios.get(`${DOCTORS_URL}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch doctors' };
    }
};

export const getDoctorById = async (doctorId) => {
    try {
        const response = await axios.get(`${DOCTORS_URL}/${doctorId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch doctor' };
    }
};

export const updateDoctorSchedule = async (doctorId, workingDays, timeSlots) => {
    try {
        const response = await axios.put(`${DOCTORS_URL}/${doctorId}/schedule`, {
            workingDays,
            timeSlots
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update schedule' };
    }
};

export const getDoctorSchedule = async (doctorId) => {
    try {
        const response = await axios.get(`${DOCTORS_URL}/${doctorId}/schedule`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch schedule' };
    }
};

export const deleteDoctor = async (doctorId) => {
    try {
        const response = await axios.delete(`${DOCTORS_URL}/${doctorId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete doctor' };
    }
};

export const getDoctorReports = async (doctorId = '', specialization = '', from = '', to = '') => {
    try {
        const response = await axios.get(`${REPORTS_URL}/doctors`, {
            params: { doctorId, specialization, from, to }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch reports' };
    }
};
