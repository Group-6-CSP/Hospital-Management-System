import React, { useState } from 'react';
import { getAppointmentHistory } from '../services/appointmentService';

function AppointmentHistory() {
    const [patientId, setPatientId] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!patientId.trim()) {
            setMessage('Please enter a patient ID');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const data = await getAppointmentHistory(patientId);
            setAppointments(data);
            if (data.length === 0) {
                setMessage('No appointments found for this patient');
            }
        } catch (error) {
            setMessage(`❌ ${error.error || 'Failed to fetch history'}`);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
                    Appointment History
                </h1>

                {/* Search Bar */}
                <div className="flex gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Enter Patient ID (e.g., P-00000001)"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg text-center">
                        {message}
                    </div>
                )}

                {/* Appointments Table */}
                {appointments.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="border px-4 py-3 text-left">Appointment ID</th>
                                    <th className="border px-4 py-3 text-left">Doctor</th>
                                    <th className="border px-4 py-3 text-left">Department</th>
                                    <th className="border px-4 py-3 text-left">Date</th>
                                    <th className="border px-4 py-3 text-left">Time</th>
                                    <th className="border px-4 py-3 text-left">Status</th>
                                    <th className="border px-4 py-3 text-left">Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => (
                                    <tr key={apt.appointmentId} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{apt.appointmentId}</td>
                                        <td className="border px-4 py-2">{apt.doctorName}</td>
                                        <td className="border px-4 py-2">{apt.department}</td>
                                        <td className="border px-4 py-2">{apt.date}</td>
                                        <td className="border px-4 py-2">{apt.time}</td>
                                        <td className="border px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                apt.status === 'Rescheduled' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="border px-4 py-2">{apt.reason || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentHistory;