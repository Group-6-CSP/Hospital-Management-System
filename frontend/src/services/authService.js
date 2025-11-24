// JavaScript source code
import axios from "axios";

const API_URL =
    `${process.env.REACT_APP_API_BASE || "https://hospital-backend-app-d5hzfjfqfbakbdcu.southeastasia-01.azurewebsites.net"}/api/auth`;

// Register API call
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Registration failed" };
    }
};

// Login API call
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        // Save token & role in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: "Login failed" };
    }
};