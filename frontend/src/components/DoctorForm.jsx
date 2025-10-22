import React, { useState } from 'react';
import { createDoctor } from '../services/doctorService';

function DoctorForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        contact: '',
        email: '',
        availability: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const result = await createDoctor(
                formData.name,
                formData.specialization,
                formData.contact,
                formData.email,
                formData.availability
            );
            setMessage(`✅ ${result.message} (ID: ${result.doctorId})`);
            setFormData({ name: '', specialization: '', contact: '', email: '', availability: '' });
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1500);
        } catch (error) {
            setMessage(`❌ ${error.error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Add Doctor</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization *
                    </label>
                    <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select specialization</option>
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact (10 digits) *
                    </label>
                    <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="e.g., 9876543210"
                        maxLength="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., john@hospital.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability *
                    </label>
                    <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        placeholder="e.g., Mon-Fri 9AM-5PM"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </form>

            {message && (
                <div className={`mb-4 p-4 rounded-lg text-center font-medium ${
                    message.includes('No') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            {reports.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Doctor ID</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Specialization</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Appointments</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Availability</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.doctorId} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm">{report.doctorId}</td>
                                    <td className="px-4 py-2 text-sm font-medium">{report.name}</td>
                                    <td className="px-4 py-2 text-sm">{report.specialization}</td>
                                    <td className="px-4 py-2 text-sm">{report.appointmentsHandled}</td>
                                    <td className="px-4 py-2 text-sm">{report.availability}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DoctorForm;
