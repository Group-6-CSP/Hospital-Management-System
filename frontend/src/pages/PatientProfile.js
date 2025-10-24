import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PatientProfile() {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const patientId = localStorage.getItem('patientId');
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!userInfo.email) {
            navigate('/login');
            return;
        }

        if (!patientId) {
            setMessage('Patient profile not found. Please contact support.');
            setLoading(false);
            return;
        }

        // Fetch patient details
        axios.get(`http://localhost:5239/api/patients/${patientId}`)
            .then(res => {
                setPatient(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching patient:', err);
                setMessage('Failed to load profile');
                setLoading(false);
            });
    }, [patientId, userInfo.email, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading profile...</p>
            </div>
        );
    }

    if (message) {
        return (
            <div className="min-h-screen bg-gray-100 py-10 px-4">
                <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                    <p className="text-red-600 text-center">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">My Profile</h1>

                {patient && (
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Patient ID
                                    </label>
                                    <p className="mt-1 text-gray-900 font-medium">
                                        {patient.patientId}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Full Name
                                    </label>
                                    <p className="mt-1 text-gray-900 font-medium">
                                        {patient.name}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Email
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {patient.email || 'Not provided'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Contact Number
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {patient.contact}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Date of Birth
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {patient.dob?.substring(0, 10)}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Age
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {patient.age}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Gender
                                    </label>
                                    <p className="mt-1 text-gray-900">
                                        {patient.gender}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Medical Notes */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Medical Notes
                            </h2>
                            <p className="text-gray-700">
                                {patient.medicalNotes || 'No medical notes available'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/patient/book-appointment')}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Book Appointment
                            </button>
                            <button
                                onClick={() => navigate('/patient/my-appointments')}
                                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                                My Appointments
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientProfile;