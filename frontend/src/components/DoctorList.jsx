import React, { useState, useEffect } from 'react';
import { getAllDoctors, deleteDoctor } from '../services/doctorService';

function DoctorList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await getAllDoctors();
            setDoctors(data);
            setLoading(false);
        } catch (err) {
            setMessage('Failed to fetch doctors');
            setLoading(false);
        }
    };

    const handleDelete = async (doctorId) => {
        if (!window.confirm('Are you sure you want to delete this doctor?')) return;

        try {
            await deleteDoctor(doctorId);
            setMessage('Doctor deleted successfully');
            fetchDoctors();
        } catch (error) {
            setMessage(`Error: ${error.error}`);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor List</h2>

            {message && (
                <div className={`mb-4 p-4 rounded-lg text-center font-medium ${
                    message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Doctor ID</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Specialization</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Contact</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold">Availability</th>
                            <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map(doctor => (
                            <tr key={doctor.doctorId} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{doctor.doctorId}</td>
                                <td className="px-4 py-2 text-sm font-medium">{doctor.name}</td>
                                <td className="px-4 py-2 text-sm">{doctor.specialization}</td>
                                <td className="px-4 py-2 text-sm">{doctor.contact}</td>
                                <td className="px-4 py-2 text-sm">{doctor.availability}</td>
                                <td className="px-4 py-2 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => setSelectedDoctor(doctor)}
                                            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                                        >
                                            Schedule
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doctor.doctorId)}
                                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedDoctor && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <button
                        onClick={() => setSelectedDoctor(null)}
                        className="float-right px-2 py-1 text-gray-600 hover:text-gray-800"
                    >
                        ✕
                    </button>
                    <h3 className="font-semibold text-blue-900">Edit Schedule: {selectedDoctor.name}</h3>
                    <p className="text-sm text-blue-700 mt-2">Select this doctor to manage schedule</p>
                </div>
            )}
        </div>
    );
}

export default DoctorList;