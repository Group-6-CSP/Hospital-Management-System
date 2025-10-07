import React, { useState } from 'react';
import { getStatistics } from '../services/appointmentService';

function AppointmentStats() {
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [stats, setStats] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFetchStats = async () => {
        setLoading(true);
        setMessage('');

        try {
            const data = await getStatistics(dateRange.from, dateRange.to);
            setStats(data);
        } catch (error) {
            setMessage(`❌ ${error.error || 'Failed to fetch statistics'}`);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
                    Appointment Statistics
                </h1>

                {/* Date Range Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        placeholder="From Date"
                        className="px-4 py-2 border rounded-lg"
                    />
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        placeholder="To Date"
                        className="px-4 py-2 border rounded-lg"
                    />
                    <button
                        onClick={handleFetchStats}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Loading...' : 'Generate Report'}
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
                        {message}
                    </div>
                )}

                {/* Statistics Display */}
                {stats && (
                    <div className="space-y-8">
                        {/* Total Appointments */}
                        <div className="bg-blue-50 p-6 rounded-lg text-center">
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Appointments</h2>
                            <p className="text-4xl font-bold text-blue-600">{stats.totalAppointments}</p>
                        </div>

                        {/* Appointments Per Doctor */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointments per Doctor</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(stats.appointmentsPerDoctor).map(([doctor, count]) => (
                                    <div key={doctor} className="bg-green-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-700">{doctor}</p>
                                        <p className="text-2xl font-bold text-green-600">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Appointments Per Department */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointments per Department</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(stats.appointmentsPerDepartment).map(([dept, count]) => (
                                    <div key={dept} className="bg-purple-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-700">{dept}</p>
                                        <p className="text-2xl font-bold text-purple-600">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppointmentStats;