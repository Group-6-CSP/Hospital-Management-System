import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generateBill } from '../services/billingService';

function BillGenerator() {
    const [appointmentId, setAppointmentId] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [labCharges, setLabCharges] = useState('0');
    const [medicineCharges, setMedicineCharges] = useState('0');
    const [discountPercent, setDiscountPercent] = useState('0');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [generatedBill, setGeneratedBill] = useState(null);

    useEffect(() => {
        fetchCompletedAppointments();
    }, []);

    const fetchCompletedAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5239/api/appointments');
            const completed = response.data.data?.filter(apt => apt.status === 'Completed') || [];
            setAppointments(completed);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setGeneratedBill(null);

        if (!appointmentId) {
            setMessage('❌ Please select an appointment');
            setLoading(false);
            return;
        }

        try {
            const bill = await generateBill(
                appointmentId,
                labCharges,
                medicineCharges,
                discountPercent,
                notes
            );
            setGeneratedBill(bill);
            setMessage('✅ Bill generated successfully!');
            setAppointmentId('');
            setLabCharges('0');
            setMedicineCharges('0');
            setDiscountPercent('0');
            setNotes('');
        } catch (error) {
            setMessage(`❌ ${error.error || 'Failed to generate bill'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
                    <h1 className="text-3xl font-bold text-blue-600 mb-6">Generate Bill</h1>

                    <form onSubmit={handleGenerateBill} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Completed Appointment
                            </label>
                            <select
                                value={appointmentId}
                                onChange={(e) => setAppointmentId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose appointment...</option>
                                {appointments.map(apt => (
                                    <option key={apt.appointmentId} value={apt.appointmentId}>
                                        {apt.appointmentId} - {apt.patientName} ({apt.doctorName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lab Charges
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={labCharges}
                                    onChange={(e) => setLabCharges(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Medicine Charges
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={medicineCharges}
                                    onChange={(e) => setMedicineCharges(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount (%) 
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g., Insurance covered, Special discount, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {loading ? 'Generating...' : 'Generate Bill'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
                            message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}
                </div>

                {generatedBill && (
                    <div className="bg-white shadow-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bill Summary</h2>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex justify-between">
                                <span>Bill ID:</span>
                                <span className="font-semibold">{generatedBill.billId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Consultation Fee:</span>
                                <span>${generatedBill.consultationFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lab Charges:</span>
                                <span>${generatedBill.labCharges.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Medicine Charges:</span>
                                <span>${generatedBill.medicineCharges.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span>Subtotal:</span>
                                <span>${generatedBill.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Discount ({generatedBill.discountPercent}%):</span>
                                <span>-${generatedBill.discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax ({generatedBill.taxPercent}%):</span>
                                <span>${generatedBill.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                <span>Total Amount:</span>
                                <span className="text-blue-600">${generatedBill.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BillGenerator;