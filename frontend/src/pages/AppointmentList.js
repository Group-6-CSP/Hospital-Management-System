import React, { useState, useEffect } from 'react';
//import { Link } from 'react-router-dom';
import axios from 'axios';
import { rescheduleAppointment, cancelAppointment } from '../services/appointmentService';

function AppointmentList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [rescheduleModal, setRescheduleModal] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({ newDate: '', newTime: '' });

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5239/api/appointments');
            setAppointments(response.data.data || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setMessage('Failed to load appointments');
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await cancelAppointment(appointmentId);
            setMessage('Appointment cancelled successfully');
            fetchAppointments();
        } catch (error) {
            setMessage(error.error || 'Cancellation failed');
        }
    };

    const openRescheduleModal = (appointment) => {
        setRescheduleModal(appointment);
        setRescheduleData({
            newDate: appointment.appointmentDate?.substring(0, 10) || '',
            newTime: appointment.appointmentTime || ''
        });
    };

    const handleReschedule = async () => {
        try {
            await rescheduleAppointment(rescheduleModal.appointmentId, rescheduleData);
            setMessage('Appointment rescheduled successfully');
            setRescheduleModal(null);
            fetchAppointments();
        } catch (error) {
            setMessage(error.error || 'Reschedule failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-600">All Appointments</h1>
                </div>

                {message && (
                    <div className={`mb-4 p-4 rounded-lg text-center font-medium ${
                        message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200">
                        <thead className="bg-blue-50 text-gray-700">
                            <tr>
                                <th className="border px-4 py-3 text-left">ID</th>
                                <th className="border px-4 py-3 text-left">Patient</th>
                                <th className="border px-4 py-3 text-left">Doctor</th>
                                <th className="border px-4 py-3 text-left">Department</th>
                                <th className="border px-4 py-3 text-left">Date</th>
                                <th className="border px-4 py-3 text-left">Time</th>
                                <th className="border px-4 py-3 text-left">Status</th>
                                <th className="border px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <tr key={apt.appointmentId} className="hover:bg-gray-50 transition">
                                        <td className="border px-4 py-2 text-sm">{apt.appointmentId}</td>
                                        <td className="border px-4 py-2">
                                            <div>
                                                <p className="font-medium">{apt.patientName || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{apt.patientId}</p>
                                            </div>
                                        </td>
                                        <td className="border px-4 py-2">
                                            <div>
                                                <p className="font-medium">{apt.doctorName || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{apt.doctorId}</p>
                                            </div>
                                        </td>
                                        <td className="border px-4 py-2">{apt.department || 'N/A'}</td>
                                        <td className="border px-4 py-2">
                                            {apt.appointmentDate?.substring(0, 10) || 'N/A'}
                                        </td>
                                        <td className="border px-4 py-2">{apt.appointmentTime || 'N/A'}</td>
                                        <td className="border px-4 py-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                apt.status === 'Rescheduled' ? 'bg-yellow-100 text-yellow-700' :
                                                apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="border px-4 py-2">
                                            <div className="flex justify-center gap-2">
                                                {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                                                    <>
                                                        <button
                                                            onClick={() => openRescheduleModal(apt)}
                                                            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition"
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(apt.appointmentId)}
                                                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-gray-500">
                                        No appointments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {rescheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reschedule Appointment</h2>
                        <p className="text-gray-600 mb-4">ID: {rescheduleModal.appointmentId}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                                <input
                                    type="date"
                                    value={rescheduleData.newDate}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                                <input
                                    type="time"
                                    value={rescheduleData.newTime}
                                    onChange={(e) => setRescheduleData({ ...rescheduleData, newTime: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleReschedule}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Confirm Reschedule
                            </button>
                            <button
                                onClick={() => setRescheduleModal(null)}
                                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AppointmentList;