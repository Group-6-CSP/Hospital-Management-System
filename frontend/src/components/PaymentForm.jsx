import React, { useState } from 'react';
import { recordPayment } from '../services/billingService';

function PaymentForm({ billId, totalAmount, onPaymentSuccess }) {
    const [amountPaid, setAmountPaid] = useState(totalAmount.toString());
    const [paymentMode, setPaymentMode] = useState('Card');
    const [transactionRef, setTransactionRef] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await recordPayment(billId, amountPaid, paymentMode, transactionRef);
            setMessage('✅ Payment recorded successfully!');
            setAmountPaid('');
            setTransactionRef('');
            if (onPaymentSuccess) onPaymentSuccess();
        } catch (error) {
            setMessage(`❌ ${error.error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Record Payment</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount to Pay (Max: ${totalAmount.toFixed(2)})
                    </label>
                    <input
                        type="number"
                        min="0.01"
                        max={totalAmount}
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Mode
                    </label>
                    <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Online">Online</option>
                        <option value="Check">Check</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Reference (Optional)
                    </label>
                    <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g., TXN12345, UPI ref, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
            </div>

            {message && (
                <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
                    message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}
        </form>
    );
}

export default PaymentForm;