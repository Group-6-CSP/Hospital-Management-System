// import React, { useState, useEffect } from 'react';
// import { getPaymentHistory } from '../services/billingService';

// function PaymentHistory({ patientId }) {
//     const [payments, setPayments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [message, setMessage] = useState('');

//     useEffect(() => {
//         fetchPayments();
//     }, [patientId]);

//     const fetchPayments = async () => {
//         try {
//             const data = await getPaymentHistory(patientId);
//             setPayments(data);
//             setLoading(false);
//         } catch (err) {
//             setMessage('❌ Failed to load payment history');
//             setLoading(false);
//         }
//     };

//     if (loading) return <div className="text-center py-10">Loading...</div>;

//     return (
//         <div className="bg-white shadow-lg rounded-2xl p-8">
//             <h2 className="text-2xl font-bold text-blue-600 mb-6">Payment History</h2>

//             {message && (
//                 <div className="mb-4 p-4 rounded-lg text-red-700 bg-red-100 text-center">
//                     {message}
//                 </div>
//             )}

//             {payments.length > 0 ? (
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-4 py-2 text-left text-sm font-semibold">Payment ID</th>
//                                 <th className="px-4 py-2 text-left text-sm font-semibold">Bill ID</th>
//                                 <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
//                                 <th className="px-4 py-2 text-left text-sm font-semibold">Mode</th>
//                                 <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
//                                 <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {payments.map(payment => (
//                                 <tr key={payment.paymentId} className="border-t hover:bg-gray-50">
//                                     <td className="px-4 py-2 text-sm">{payment.paymentId}</td>
//                                     <td className="px-4 py-2 text-sm">{payment.billId}</td>
//                                     <td className="px-4 py-2 text-sm font-semibold">${payment.amountPaid.toFixed(2)}</td>
//                                     <td className="px-4 py-2 text-sm">{payment.paymentMode}</td>
//                                     <td className="px-4 py-2 text-sm">{payment.paymentDate}</td>
//                                     <td className="px-4 py-2 text-sm">
//                                         <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
//                                             {payment.status}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             ) : (
//                 <div className="text-center text-gray-500 py-8">
//                     No payments recorded yet
//                 </div>
//             )}
//         </div>
//     );
// }

// export default PaymentHistory;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PaymentHistory({ patientId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!patientId) {
            setMessage('❌ Patient ID not found');
            setLoading(false);
            return;
        }
        fetchPayments();
    }, [patientId]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`http://localhost:5239/api/payments/history/${patientId}`);
            setPayments(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payments:', err);
            // If no payments found, don't show error - just empty list
            setPayments([]);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Payment History</h2>

            {message && (
                <div className="mb-4 p-4 rounded-lg text-red-700 bg-red-100 text-center">
                    {message}
                </div>
            )}

            {payments.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Payment ID</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Bill ID</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Mode</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.paymentId} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm">{payment.paymentId}</td>
                                    <td className="px-4 py-2 text-sm">{payment.billId}</td>
                                    <td className="px-4 py-2 text-sm font-semibold">Rs {payment.amountPaid.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm">{payment.paymentMode}</td>
                                    <td className="px-4 py-2 text-sm">{payment.paymentDate}</td>
                                    <td className="px-4 py-2 text-sm">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-12">
                    <p className="text-lg">No payments recorded yet</p>
                </div>
            )}
        </div>
    );
}

export default PaymentHistory;