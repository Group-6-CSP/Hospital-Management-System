import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contact: '',
        specialization: '',
        departmentId: '',
        availability: ''
    });
    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5239";

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/departments`);
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setMessage('❌ Failed to load departments');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.contact || !formData.departmentId) {
            setMessage('❌ All mandatory fields are required');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setMessage('❌ Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (formData.contact.length !== 10 || isNaN(formData.contact)) {
            setMessage('❌ Contact must be 10 digits');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/api/doctors/create-account`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                contact: formData.contact,
                specialization: formData.specialization,
                departmentId: formData.departmentId,
                availability: formData.availability
            });

            setMessage(
                `✅ Doctor account created successfully!\n\n` +
                `Doctor ID: ${response.data.doctorId}\n` +
                `Email: ${response.data.loginEmail}\n` +
                `Password: ${response.data.loginPassword}\n\n` +
                `Share these credentials with the doctor.`
            );

            setFormData({
                name: '',
                email: '',
                password: '',
                contact: '',
                specialization: '',
                departmentId: '',
                availability: ''
            });

            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to create doctor account';
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Add Doctor Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Dr. John Smith"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="doctor@hospital.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-600 text-lg"
                            >
                                {showPassword ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
                        <input
                            type="tel"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="10 digits only"
                            maxLength="10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                        <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            placeholder="e.g., Cardiologist"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                    {dept.departmentName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        placeholder="e.g., Mon-Fri 9AM-5PM"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold"
                >
                    {loading ? 'Creating Account...' : 'Create Doctor Account'}
                </button>
            </form>

            {message && (
                <div className={`mt-6 p-4 rounded-lg whitespace-pre-line font-medium text-sm ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default DoctorForm;