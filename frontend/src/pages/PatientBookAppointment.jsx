import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PatientBookAppointment() {
    const API_BASE = process.env.REACT_APP_API_BASE || "";
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        departmentId: '',
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    });
    const [departments, setDepartments] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const patientId = localStorage.getItem('patientId');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!userInfo.email) {
            navigate('/login?redirect=/patient/book-appointment');
            return;
        }
        fetchDepartments();
    }, [userInfo.email, navigate]);

    // ✅ Fetch departments from Azure backend
    const fetchDepartments = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/departments`);
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    // ✅ Fetch doctors by department (Azure)
    const handleDepartmentChange = async (e) => {
        const departmentId = e.target.value;
        setFormData({ ...formData, departmentId, doctorId: '' });

        if (departmentId) {
            try {
                const response = await axios.get(
                    `${API_BASE}/api/doctors/by-department/${departmentId}`
                );
                setFilteredDoctors(response.data);
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setFilteredDoctors([]);
            }
        } else {
            setFilteredDoctors([]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Submit appointment using Azure backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!patientId) {
            setMessage('❌ Patient ID not found');
            return;
        }

        if (!formData.departmentId || !formData.doctorId || !formData.date || !formData.time || !formData.reason) {
            setMessage('❌ All fields are required');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_BASE}/api/appointments`, {
                patientId: patientId,
                doctorId: formData.doctorId,
                date: formData.date,
                time: formData.time,
                reason: formData.reason
            });

            setMessage(`✅ Appointment booked successfully! ID: ${response.data.appointmentId}`);
            setTimeout(() => navigate('/patient/my-appointments'), 2000);
        } catch (error) {
            setMessage(`❌ ${error.response?.data?.error || 'Booking failed'}`);
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Book Appointment</h1>
                <p className="text-gray-600 text-center mb-8">Select department and doctor</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Department */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                        <select
                            value={formData.departmentId}
                            onChange={handleDepartmentChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

                    {/* Doctor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!formData.departmentId}
                        >
                            <option value="">
                                {formData.departmentId ? 'Select Doctor' : 'Choose Department First'}
                            </option>
                            {filteredDoctors.map(doctor => (
                                <option key={doctor.doctorId} value={doctor.doctorId}>
                                    {doctor.name} - {doctor.specialization}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Time</option>
                                {timeSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit *</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Describe your symptoms..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg text-center font-medium ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientBookAppointment;