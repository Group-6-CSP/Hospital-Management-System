import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DoctorAppointmentsList() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const doctorEmail = userInfo.email;
            const response = await axios.get('http://localhost:5239/api/appointments');
            const allAppointments = response.data.data || [];

            // Get doctor ID from email (you may need to fetch this separately)
            // For now, filtering by email if available
            setAppointments(allAppointments);
            setFilteredAppointments(allAppointments);
            setLoading(false);
        } catch (err) {
            setMessage('Failed to fetch appointments');
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            await axios.put(`http://localhost:5239/api/appointments/${appointmentId}/status`, {
                status: newStatus
            });

            setMessage(`Status updated to ${newStatus}`);
            fetchAppointments();
        } catch (error) {
            setMessage(`Error: ${error.response?.data?.error}`);
        }
    };

    const handleFilterByDate = () => {
        let filtered = appointments;

        if (fromDate) {
            filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= new Date(fromDate));
        }
        if (toDate) {
            filtered = filtered.filter(apt => new Date(apt.appointmentDate) <= new Date(toDate));
        }

        setFilteredAppointments(filtered);
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Appointments</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilterByDate}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            </div>

            {message && (
                <div className="mb-4 p-4 rounded-lg bg-blue-100 text-blue-700">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(apt => (
                        <div key={apt.appointmentId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">Patient Name</p>
                                    <p className="font-semibold text-lg">{apt.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <select
                                        value={apt.status}
                                        onChange={(e) => handleStatusChange(apt.appointmentId, e.target.value)}
                                        className={`px-3 py-1 rounded text-sm font-semibold border-none cursor-pointer ${
                                            apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                                            apt.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                                            apt.status === 'In-Progress' ? 'bg-purple-100 text-purple-700' :
                                            'bg-green-100 text-green-700'
                                        }`}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="In-Progress">In-Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Contact</p>
                                    <p className="font-medium">{apt.patientContact}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Email</p>
                                    <p className="font-medium">{apt.patientEmail}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Date & Time</p>
                                    <p className="font-medium">{apt.appointmentDate} at {apt.appointmentTime}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Reason</p>
                                    <p className="font-medium">{apt.reason}</p>
                                </div>
                            </div>

                            {apt.patientMedicalNotes && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Medical Notes</p>
                                    <p className="text-sm text-gray-800">{apt.patientMedicalNotes}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>No appointments found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorAppointmentsList;