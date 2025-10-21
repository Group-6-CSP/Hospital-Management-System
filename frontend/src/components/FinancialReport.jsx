import React, { useState } from 'react';
import { getFinancialReport } from '../services/billingService';

function FinancialReport() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const data = await getFinancialReport(startDate, endDate);
            setReport(data);
        } catch (error) {
            setMessage(`❌ ${error.error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
                    <h1 className="text-3xl font-bold text-blue-600 mb-6">Financial Reports</h1>

                    <form onSubmit={handleGenerateReport} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </form>

                    {message && (
                        <div className="mt-4 p-4 rounded-lg text-red-700 bg-red-100 text-center">
                            {message}
                        </div>
                    )}
                </div>

                {report && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Revenue</h3>
                            <p className="text-4xl font-bold text-green-600">
                                ${report.totalRevenue.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Outstanding Payments</h3>
                            <p className="text-4xl font-bold text-red-600">
                                ${report.outstandingPayments.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Discounts</h3>
                            <p className="text-4xl font-bold text-yellow-600">
                                ${report.totalDiscount.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Tax Collected</h3>
                            <p className="text-4xl font-bold text-blue-600">
                                ${report.totalTax.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Paid Amount</h3>
                            <p className="text-4xl font-bold text-purple-600">
                                ${report.paidAmount.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Bills</h3>
                            <p className="text-4xl font-bold text-indigo-600">
                                {report.totalBills}
                            </p>
                        </div>

                        <div className="md:col-span-2 bg-white shadow-lg rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Period</h3>
                            <p className="text-lg text-gray-600">{report.reportPeriod}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FinancialReport;