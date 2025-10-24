import axios from 'axios';

const API_URL = 'http://localhost:5239/api/appointments';

export const bookAppointment = async (appointmentData) => {
    try {
        const response = await axios.post(API_URL, appointmentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Booking failed' };
    }
};

export const getAppointmentHistory = async (patientId, page = 1, pageSize = 10) => {
    try {
        const response = await axios.get(`${API_URL}/history/${patientId}`, {
            params: { page, pageSize }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch history' };
    }
};

export const rescheduleAppointment = async (appointmentId, newData) => {
    try {
        const response = await axios.put(`${API_URL}/${appointmentId}/reschedule`, newData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Reschedule failed' };
    }
};

export const getStatistics = async (from, to) => {
    try {
        const params = {};
        if (from) params.from = from;
        if (to) params.to = to;
        
        const response = await axios.get(`${API_URL}/statistics`, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch statistics' };
    }
};

export const cancelAppointment = async (appointmentId) => {
    try {
        const response = await axios.delete(`${API_URL}/${appointmentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Cancellation failed' };
    }
};