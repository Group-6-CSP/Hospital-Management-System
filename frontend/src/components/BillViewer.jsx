import React, { useState, useEffect } from 'react';
import { getBillById, recordPayment } from '../services/billingService';

function BillViewer({ billId }) {
    // Optional: keep API_BASE for future use (not required)
    //const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5239";

    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentMode, setPaymentMode] = useState('Card');
    const [transactionRef, setTransactionRef] = useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchBill();
    }, [billId]);

    const fetchBill = async () => {
        try {
            const data = await getBillById(billId);
            setBill(data);
            setLoading(false);
        } catch (err) {
            setMessage('❌ Failed to load bill');
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!amountPaid || parseFloat(amountPaid) <= 0) {
            setMessage('❌ Enter valid amount');
            return;
        }

        try {
            await recordPayment(billId, amountPaid, paymentMode, transactionRef);
            setMessage('✅ Payment recorded successfully!');
            setAmountPaid('');
            setTransactionRef('');
            setShowPaymentForm(false);
            fetchBill();
        } catch (error) {
            setMessage(`❌ ${error.error}`);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!bill) return <div className="text-center text-red-600">Bill not found</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Bill Details</h2>

            <div className="space-y-4 text-gray-700 mb-6">
                <div className="flex justify-between border-b pb-2">
                    <span>Bill ID:</span>
                    <span className="font-semibold">{bill.billId}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span>Status:</span>
                    <span className={`font-semibold ${bill.status === 'Paid'
                            ? 'text-green-600'
                            : bill.status === 'PartiallyPaid'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                        }`}>
                        {bill.status}
                    </span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span>Consultation:</span>
                    <span>${bill.consultationFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span>Lab Charges:</span>
                    <span>${bill.labCharges.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span>Medicine:</span>
                    <span>${bill.medicineCharges.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span>Discount:</span>
                    <span>-${bill.discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b pb-2">
                    <span>Tax:</span>
                    <span>${bill.taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">${bill.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {bill.status !== 'Paid' && (
                <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="w-full mt-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    {showPaymentForm ? 'Cancel Payment' : 'Record Payment'}
                </button>
            )}

            {showPaymentForm && (
                <form onSubmit={handlePayment} className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount to Pay
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder={`Max: ${bill.totalAmount.toFixed(2)}`}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Mode
                        </label>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Online">Online</option>
                            <option value="Check">Check</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transaction Reference (Optional)
                        </label>
                        <input
                            type="text"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            placeholder="e.g., TXN12345"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Confirm Payment
                    </button>
                </form>
            )}

            {message && (
                <div className={`mt-4 p-4 rounded-lg text-center font-medium ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default BillViewer;