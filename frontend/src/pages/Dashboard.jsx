import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DoctorForm from '../components/DoctorForm';
import DoctorList from '../components/DoctorList';
import DoctorSchedule from '../components/DoctorSchedule';
import DoctorReports from '../components/DoctorReports';
import BillGenerator from '../components/BillGenerator';
import FinancialReport from '../components/FinancialReport';
import PaymentHistory from '../components/PaymentHistory';
import AddDoctorForm from '../components/AddDoctorForm';
import DoctorAppointmentsList from '../components/DoctorAppointmentsList';
import BillGeneratorUpdated from '../components/BillGeneratorUpdated';
import PatientBookAppointment from './PatientBookAppointment';


function Dashboard() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.email) {
            navigate('/login');
            return;
        }
        setUserInfo(user);
    }, [navigate]);

    if (!userInfo) return <div className="text-center py-10">Loading...</div>;

    const isAdmin = userInfo.role === 'Admin';
    const isDoctor = userInfo.role === 'Doctor';
    const isPatient = userInfo.role === 'Patient';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Smart Care Hospital</h1>
                        <p className="text-blue-100">Welcome, {userInfo.role}!</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium">{userInfo.email}</p>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login');
                            }}
                            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto">
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('add-doctor')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'add-doctor'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Add Doctor
                            </button>
                            <button
                                onClick={() => setActiveTab('doctors')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'doctors'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Doctors
                            </button>
                            <button
                                onClick={() => setActiveTab('billing')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'billing'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Billing
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'reports'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Reports
                            </button>
                        </>
                    )}
                    {isDoctor && (
                        <>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                My Schedule
                            </button>
                            <button
                                onClick={() => setActiveTab('appointments')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'appointments'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Appointments
                            </button>
                        </>
                    )}
                    {isPatient && (
                        <>
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Home
                            </button>
                            <button
                                onClick={() => setActiveTab('appointments')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'appointments'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                My Appointments
                            </button>
                            <button
                                onClick={() => setActiveTab('billing')}
                                className={`px-4 py-3 font-medium border-b-2 transition ${
                                    activeTab === 'billing'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Bills & Payments
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* ADMIN VIEWS */}
                {isAdmin && activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Link to="/admin/patients">
                            <div className="bg-white hover:shadow-lg transition rounded-xl p-6 shadow-md cursor-pointer">
                                <div className="text-4xl mb-4">👥</div>
                                <h3 className="text-lg font-semibold text-gray-800">Patients</h3>
                                <p className="text-sm text-gray-600">Manage patient records</p>
                            </div>
                        </Link>
                        <Link to="/admin/appointments">
                            <div className="bg-white hover:shadow-lg transition rounded-xl p-6 shadow-md cursor-pointer">
                                <div className="text-4xl mb-4">📅</div>
                                <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
                                <p className="text-sm text-gray-600">Manage appointments</p>
                            </div>
                        </Link>
                        <div
                            onClick={() => setActiveTab('billing')}
                            className="bg-white hover:shadow-lg transition rounded-xl p-6 shadow-md cursor-pointer"
                        >
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="text-lg font-semibold text-gray-800">Billing</h3>
                            <p className="text-sm text-gray-600">Generate & manage bills</p>
                        </div>
                        <div
                            onClick={() => setActiveTab('reports')}
                            className="bg-white hover:shadow-lg transition rounded-xl p-6 shadow-md cursor-pointer"
                        >
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                            <p className="text-sm text-gray-600">View financial reports</p>
                        </div>
                    </div>
                )}

                {isAdmin && activeTab === 'doctors' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
                            <button
                                onClick={() => setActiveTab('add-doctor')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                + Add Doctor
                            </button>
                        </div>
                        <DoctorList />
                    </div>
                )}

                {isAdmin && activeTab === 'add-doctor' && (
                    <div>
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Back
                        </button>
                        <DoctorForm onSuccess={() => setActiveTab('doctors')} />
                    </div>
                )}

                {isAdmin && activeTab === 'billing' && <BillGenerator />}
                {isAdmin && activeTab === 'billing' && <BillGeneratorUpdated />}
                {isAdmin && activeTab === 'reports' && (
                    <div className="space-y-6">
                        <FinancialReport />
                        <DoctorReports />
                    </div>
                )}
                {isAdmin && activeTab === 'add-doctor' && (
                    <div>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Back
                        </button>
                        <AddDoctorForm onSuccess={() => setActiveTab('overview')} />
                    </div>
                )}


                {/* DOCTOR VIEWS */}
                {isDoctor && activeTab === 'overview' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
                        <DoctorSchedule />
                    </div>
                )}
                {isDoctor && activeTab === 'appointments' && <DoctorAppointmentsList />}

                {isDoctor && activeTab === 'appointments' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
                        <div className="bg-white shadow-lg rounded-2xl p-8">
                            <p className="text-gray-600 text-center py-8">Coming soon...</p>
                        </div>
                    </div>
                )}

                {/* PATIENT VIEWS */}
                {isPatient && activeTab === 'overview' && (
                    <div>
                        <h1 className="text-3xl font-bold text-blue-600 mb-8">Welcome, Patient! 👋</h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link to="/patient/book-appointment">
                                <div className="bg-blue-50 hover:bg-blue-100 transition rounded-xl p-6 shadow-md cursor-pointer">
                                    <div className="text-4xl mb-4">📅</div>
                                    <h3 className="text-lg font-semibold text-blue-700">Book Appointment</h3>
                                    <p className="text-sm text-gray-600">Schedule a visit</p>
                                </div>
                            </Link>
                            <div
                                onClick={() => setActiveTab('appointments')}
                                className="bg-green-50 hover:bg-green-100 transition rounded-xl p-6 shadow-md cursor-pointer"
                            >
                                <div className="text-4xl mb-4">📋</div>
                                <h3 className="text-lg font-semibold text-green-700">My Appointments</h3>
                                <p className="text-sm text-gray-600">View your appointments</p>
                            </div>
                            <div
                                onClick={() => setActiveTab('billing')}
                                className="bg-purple-50 hover:bg-purple-100 transition rounded-xl p-6 shadow-md cursor-pointer"
                            >
                                <div className="text-4xl mb-4">💳</div>
                                <h3 className="text-lg font-semibold text-purple-700">Bills & Payments</h3>
                                <p className="text-sm text-gray-600">View your bills</p>
                            </div>
                        </div>
                    </div>
                )}

                {isPatient && activeTab === 'appointments' && (
                    <div>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Back
                        </button>
                        <Link to="/patient/my-appointments">
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <p className="text-lg text-gray-600">Click to view your appointments</p>
                            </div>
                        </Link>
                    </div>
                )}

                {isPatient && activeTab === 'billing' && (
                    <div>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Back
                        </button>
                        <PaymentHistory patientId={localStorage.getItem('patientId')} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;