import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { bookAppointment } from '../services/appointmentService';

function PatientBookAppointment() {
    const API_BASE = process.env.REACT_APP_API_BASE || '';
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const patientId = localStorage.getItem('patientId');

    useEffect(() => {
        if (!userInfo.email) {
            navigate('/login?redirect=/patient/book-appointment');
            return;
        }

        axios.get(`${API_BASE}/api/doctors`)
            .then(res => {
                setDoctors(res.data);
                const uniqueDepts = [...new Set(res.data.map(d => d.department))];
                setDepartments(uniqueDepts);
            })
            .catch(err => console.error('Error fetching doctors:', err));
    }, [userInfo.email, navigate, API_BASE]);

    useEffect(() => {
        if (selectedDepartment) {
            const filtered = doctors.filter(d => d.department === selectedDepartment);
            setFilteredDoctors(filtered);
        } else {
            setFilteredDoctors([]);
        }
    }, [selectedDepartment, doctors]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
        setFormData({ ...formData, doctorId: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!patientId) {
            setMessage('❌ Patient ID not found. Please complete your profile first.');
            return;
        }

        if (!formData.doctorId) {
            setMessage('❌ Please select a doctor');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const appointmentData = {
                patientId: patientId,
                doctorId: formData.doctorId,
                date: formData.date,
                time: formData.time,
                reason: formData.reason
            };

            const result = await bookAppointment(appointmentData);
            setMessage(`✅ Appointment booked successfully! Your appointment ID is ${result.appointmentId}`);

            setTimeout(() => {
                navigate('/patient/my-appointments');
            }, 3000);
        } catch (error) {
            setMessage(`❌ ${error.error || 'Booking failed. Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">
                    Book Your Appointment
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Choose a doctor and schedule your visit
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Department <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Choose a department...</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Doctor <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                            disabled={!selectedDepartment}
                        >
                            <option value="">
                                {selectedDepartment ? 'Choose a doctor...' : 'Please select a department first'}
                            </option>
                            {filteredDoctors.map(doctor => (
                                <option key={doctor.doctorId} value={doctor.doctorId}>
                                    {doctor.name} - {doctor.specialization}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Time <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select time slot...</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="09:30">09:30 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="10:30">10:30 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="11:30">11:30 AM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="14:30">02:30 PM</option>
                            <option value="15:00">03:00 PM</option>
                            <option value="15:30">03:30 PM</option>
                            <option value="16:00">04:00 PM</option>
                            <option value="16:30">04:30 PM</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Visit
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Please describe your symptoms or reason for visit..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.doctorId}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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