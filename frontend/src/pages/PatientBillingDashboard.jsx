import React, { useState, useEffect } from 'react';
import { getPatientBills } from '../services/billingService';
import BillViewer from '../components/BillViewer';
import PaymentHistory from '../components/PaymentHistory';

function PatientBillingDashboard() {
    const [bills, setBills] = useState([]);
    const [selectedBillId, setSelectedBillId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bills');
    const patientId = localStorage.getItem('patientId');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (patientId) {
            fetchBills();
        }
    }, [patientId]);

    const fetchBills = async () => {
        try {
            const data = await getPatientBills(patientId);
            setBills(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching bills:', err);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
                    <h1 className="text-3xl font-bold text-blue-600">My Bills & Payments</h1>
                    <p className="text-gray-600">View your bills and payment history</p>
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('bills')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                            activeTab === 'bills'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        My Bills
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                            activeTab === 'payments'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Payment History
                    </button>
                </div>

                {activeTab === 'bills' && (
                    <div>
                        {!selectedBillId ? (
                            <div className="bg-white shadow-lg rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Bills</h2>
                                {bills.length > 0 ? (
                                    <div className="space-y-3">
                                        {bills.map(bill => (
                                            <div
                                                key={bill.billId}
                                                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                                                onClick={() => setSelectedBillId(bill.billId)}
                                            >
                                                <div>
                                                    <p className="font-semibold">{bill.billId}</p>
                                                    <p className="text-sm text-gray-600">{bill.billDate}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-lg">${bill.totalAmount.toFixed(2)}</p>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        bill.status === 'PartiallyPaid' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {bill.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500">No bills found</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => setSelectedBillId(null)}
                                    className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Back to Bills
                                </button>
                                <BillViewer billId={selectedBillId} />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'payments' && <PaymentHistory patientId={patientId} />}
            </div>
        </div>
    );
}

export default PatientBillingDashboard;
