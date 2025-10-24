import React, { useState } from 'react';
import { getDoctorReports } from '../services/doctorService';

function DoctorReports() {
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        specialization: ''
    });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const specializations = [
        'Cardiology',
        'Neurology',
        'Dermatology',
        'Pediatrics',
        'Orthopedics',
        'General Medicine',
        'ENT',
        'Ophthalmology'
    ];

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const data = await getDoctorReports(
                '',
                filters.specialization,
                filters.from,
                filters.to
            );
            setReports(data);
            if (data.length === 0) {
                setMessage('No doctors found for selected filters');
            }
        } catch (error) {
            setMessage(`Error: ${error.error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor Reports</h2>

            <form onSubmit={handleGenerateReport} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Specialization
                        </label>
                        <select
                            value={filters.specialization}
                            onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
                >
                    {loading ? 'Generating Report...' : 'Generate Report'}
                </button>
            </form>

            {message && (
                <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
                    message.includes('No') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            {reports.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Doctor ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Specialization</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Appointments</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Availability</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Working Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => {
                                let workingDays = [];
                                try {
                                    workingDays = JSON.parse(report.workingDays || '[]');
                                } catch (e) {
                                    workingDays = [];
                                }

                                return (
                                    <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{report.doctorId}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{report.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{report.specialization}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                {report.appointmentsHandled}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{report.availability}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {workingDays.length > 0 ? workingDays.join(', ') : 'Not Set'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Report Summary</h3>
                        <p className="text-sm text-blue-800">Total Doctors: {reports.length}</p>
                        <p className="text-sm text-blue-800">
                            Total Appointments: {reports.reduce((sum, r) => sum + r.appointmentsHandled, 0)}
                        </p>
                    </div>
                </div>
            )}

            {reports.length === 0 && !message && !loading && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Select filters and click "Generate Report" to view doctor reports</p>
                </div>
            )}
        </div>
    );
}

export default DoctorReports;