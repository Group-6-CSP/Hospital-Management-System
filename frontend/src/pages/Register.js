import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contact: "",
        dob: "",
        gender: ""
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setMessage("Invalid email format");
            return;
        }

        if (!/^\d{10}$/.test(formData.contact)) {
            setMessage("Contact must be 10 digits");
            return;
        }

        try {
            // Register user
            const userResponse = await axios.post('http://localhost:5239/api/auth/register', {
                email: formData.email,
                password: formData.password,
                role: 'Patient'
            });

            // Register patient
            const patientResponse = await axios.post('http://localhost:5239/api/patients', {
                userId: userResponse.data.userId,
                name: formData.fullName,
                dob: formData.dob,
                gender: formData.gender,
                contact: formData.contact,
                email: formData.email,
                medicalNotes: ""
            });

            setMessage("Registration successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
                    Smart Care Hospital
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Create your patient account
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            name="contact"
                            placeholder="Enter 10-digit contact number"
                            value={formData.contact}
                            onChange={handleChange}
                            maxLength="10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Register
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center font-medium ${
                        message.includes("successful") ? "text-green-600" : "text-red-600"
                    }`}>
                        {message}
                    </p>
                )}

                <p className="mt-6 text-center text-gray-500 text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Register;