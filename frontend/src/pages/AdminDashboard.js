import React from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Welcome Admin! What would you like to do?
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    <Link to="/admin/register">
                        <div className="bg-blue-50 hover:bg-blue-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <h3 className="text-lg font-semibold text-blue-700 mb-2">
                                Register Patient
                            </h3>
                            <p className="text-sm text-gray-600">
                                Add a new patient into the system.
                            </p>
                        </div>
                    </Link>

                    <Link to="/admin/patients">
                        <div className="bg-green-50 hover:bg-green-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <h3 className="text-lg font-semibold text-green-700 mb-2">
                                Manage Patients
                            </h3>
                            <p className="text-sm text-gray-600">
                                View, edit, or delete patient records.
                            </p>
                        </div>
                    </Link>

                    <Link to="/admin/appointments">
                        <div className="bg-purple-50 hover:bg-purple-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <h3 className="text-lg font-semibold text-purple-700 mb-2">
                                Manage Appointments
                            </h3>
                            <p className="text-sm text-gray-600">
                                View, reschedule, or cancel appointments.
                            </p>
                        </div>
                    </Link>

                    <Link to="/admin/appointments/stats">
                        <div className="bg-orange-50 hover:bg-orange-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <h3 className="text-lg font-semibold text-orange-700 mb-2">
                                Statistics
                            </h3>
                            <p className="text-sm text-gray-600">
                                View hospital performance analytics.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;