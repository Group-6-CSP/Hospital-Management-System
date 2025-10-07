import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentHistory, cancelAppointment } from '../services/appointmentService';

function PatientMyAppointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const patientId = localStorage.getItem('patientId');

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!patientId) {
                navigate('/login');
                return;
            }

            try {
                const data = await getAppointmentHistory(patientId);
                setAppointments(data);
                setLoading(false);
            } catch (error) {
                setMessage('Failed to load appointments');
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [patientId, navigate]);

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await cancelAppointment(appointmentId);
            setMessage('Appointment cancelled successfully');
            
            // Refresh appointments
            const data = await getAppointmentHistory(patientId);
            setAppointments(data);
        } catch (error) {
            setMessage(error.error || 'Cancellation failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading your appointments...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">My Appointments</h1>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
                        message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                {appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.map(apt => (
                            <div key={apt.appointmentId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {apt.doctorName}
                                        </h3>
                                        <p className="text-sm text-blue-600">{apt.department}</p>
                                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                                            <p><span className="font-medium">Date:</span> {apt.date}</p>
                                            <p><span className="font-medium">Time:</span> {apt.time}</p>
                                            <p><span className="font-medium">Reason:</span> {apt.reason || 'N/A'}</p>
                                            <p><span className="font-medium">ID:</span> {apt.appointmentId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                            apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                            apt.status === 'Rescheduled' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {apt.status}
                                        </span>
                                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                                            <button
                                                onClick={() => handleCancel(apt.appointmentId)}
                                                className="mt-4 px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">You don't have any appointments yet</p>
                        <button
                            onClick={() => navigate('/patient/book-appointment')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Book Your First Appointment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientMyAppointments;