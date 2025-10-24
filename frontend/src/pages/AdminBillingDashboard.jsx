import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BillGenerator from '../components/BillGenerator';

function AdminBillingDashboard() {
    const [activeTab, setActiveTab] = useState('generate');

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Billing Management</h1>
                    <p className="text-gray-600">Manage bills, payments, and view financial reports</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Link to="/admin/billing/generate">
                        <div className="bg-blue-50 hover:bg-blue-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <div className="text-4xl mb-3">📄</div>
                            <h3 className="text-lg font-semibold text-blue-700">Generate Bill</h3>
                            <p className="text-sm text-gray-600">Create new bills</p>
                        </div>
                    </Link>

                    <Link to="/admin/billing/view-all">
                        <div className="bg-green-50 hover:bg-green-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <div className="text-4xl mb-3">📋</div>
                            <h3 className="text-lg font-semibold text-green-700">View All Bills</h3>
                            <p className="text-sm text-gray-600">Manage all bills</p>
                        </div>
                    </Link>

                    <Link to="/admin/billing/payments">
                        <div className="bg-purple-50 hover:bg-purple-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <div className="text-4xl mb-3">💳</div>
                            <h3 className="text-lg font-semibold text-purple-700">Payments</h3>
                            <p className="text-sm text-gray-600">Track payments</p>
                        </div>
                    </Link>

                    <Link to="/admin/billing/reports">
                        <div className="bg-orange-50 hover:bg-orange-100 transition rounded-xl p-6 shadow-md cursor-pointer text-center">
                            <div className="text-4xl mb-3">📊</div>
                            <h3 className="text-lg font-semibold text-orange-700">Reports</h3>
                            <p className="text-sm text-gray-600">Financial reports</p>
                        </div>
                    </Link>
                </div>

                <BillGenerator />
            </div>
        </div>
    );
}

export default AdminBillingDashboard;
