import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookAppointment } from '../services/appointmentService';
import axios from 'axios';

function BookAppointment() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    });
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE = process.env.REACT_APP_API_BASE || '';

    useEffect(() => {
        // Fetch doctors
        axios.get(`${API_BASE}/api/doctors`)
            .then(res => setDoctors(res.data))
            .catch(err => console.error('Error fetching doctors:', err));

        // Fetch patients
        axios.get(`${API_BASE}/api/patients`)
            .then(res => setPatients(res.data))
            .catch(err => console.error('Error fetching patients:', err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const result = await bookAppointment(formData);
            setMessage(` ${result.message} (ID: ${result.appointmentId})`);
            setTimeout(() => navigate('/admin/appointments'), 2000);
        } catch (error) {
            setMessage(` ${error.error || 'Booking failed'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
                    Book New Appointment
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Patient
                        </label>
                        <select
                            name="patientId"
                            value={formData.patientId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map(p => (
                                <option key={p.patientId} value={p.patientId}>
                                    {p.patientId} - {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Doctor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Doctor
                        </label>
                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Choose a doctor...</option>
                            {doctors.map(d => (
                                <option key={d.doctorId} value={d.doctorId}>
                                    {d.name} - {d.department}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appointment Time
                        </label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Visit
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="e.g., Regular checkup, Follow-up..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </form>

                {/* Message */}
                {message && (
                    <div className={`mt-6 p-4 rounded-lg text-center font-medium ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/appointments')}
                    className="mt-4 w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Back to Appointments
                </button>
            </div>
        </div>
    );
}

export default BookAppointment;