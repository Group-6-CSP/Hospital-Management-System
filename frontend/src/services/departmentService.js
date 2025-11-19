import axios from 'axios';

const API_BASE =
    process.env.REACT_APP_API_BASE ||
    "https://hospital-backend-app-d5hzfjfqfbakbdcu.southeastasia-01.azurewebsites.net";

const DEPARTMENTS_URL = `${API_BASE}/api/departments`;
const LAB_SERVICES_URL = `${API_BASE}/api/labservices`;

export const getAllDepartments = async () => {
    try {
        const response = await axios.get(DEPARTMENTS_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch departments' };
    }
};

export const getDoctorsByDepartment = async (departmentId) => {
    try {
        const response = await axios.get(`${API_BASE}/api/doctors/by-department/${departmentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch doctors' };
    }
};

export const getAllLabServices = async () => {
    try {
        const response = await axios.get(LAB_SERVICES_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch lab services' };
    }
};
