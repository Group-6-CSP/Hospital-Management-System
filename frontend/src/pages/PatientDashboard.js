import React from 'react';
import { Link } from 'react-router-dom';

function PatientDashboard() {
    const patientInfo = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">
                        Welcome, {patientInfo.fullName || 'Patient'}!
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