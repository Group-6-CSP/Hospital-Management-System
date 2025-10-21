import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PatientDashboard() {
    const navigate = useNavigate();
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const patientId = localStorage.getItem('patientId');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!userInfo.email) {
            navigate('/login');
            return;
        }

        // Fetch patient details if patientId exists
        if (patientId) {
            axios.get(`http://localhost:5239/api/patients/${patientId}`)
                .then(res => {
                    setPatientInfo(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching patient info:', err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [navigate, patientId]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getFirstName = () => {
        if (patientInfo && patientInfo.name) {
            return patientInfo.name.split(' ')[0];
        }
        return 'there';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">
                        {getGreeting()}, {getFirstName()}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Manage your appointments and health records
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/patient/book-appointment">
                        <div className="bg-blue-50 hover:bg-blue-100 transition rounded-xl p-6 shadow-md cursor-pointer">
                            <div className="text-4xl mb-4">📅</div>
                            <h3 className="text-xl font-semibold text-blue-700 mb-2">
                                Book Appointment
                            </h3>
                            <p className="text-sm text-gray-600">
                                Schedule a visit with available doctors
                            </p>
                        </div>
                    </Link>
                       <Link to="/patient/billing">
                        <div className="bg-red-50 hover:bg-red-100 transition rounded-xl p-6 shadow-md cursor-pointer">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold text-red-700 mb-2">
                                Bills & Payments
                            </h3>
                            <p className="text-sm text-gray-600">
                                View bills and payment history
                            </p>
                        </div>
                    </Link>

                    <Link to="/patient/my-appointments">
                        <div className="bg-green-50 hover:bg-green-100 transition rounded-xl p-6 shadow-md cursor-pointer">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-green-700 mb-2">
                                My Appointments
                            </h3>
                            <p className="text-sm text-gray-600">
                                View your appointment history
                            </p>
                        </div>
                    </Link>

                    <Link to="/patient/profile">
                        <div className="bg-purple-50 hover:bg-purple-100 transition rounded-xl p-6 shadow-md cursor-pointer">
                            <div className="text-4xl mb-4">👤</div>
                            <h3 className="text-xl font-semibold text-purple-700 mb-2">
                                My Profile
                            </h3>
                            <p className="text-sm text-gray-600">
                                Update your personal information
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;