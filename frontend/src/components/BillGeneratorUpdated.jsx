import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { generateBill } from '../services/billingService';
import { getAllLabServices } from '../services/departmentService';

function BillGeneratorUpdated() {

    //  FIX: Use env variable for Azure deployment
    const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5239";

    const [appointmentId, setAppointmentId] = useState('');
    const [appointments, setAppointments] = useState([]);
    const [labServices, setLabServices] = useState([]);
    const [selectedLabServices, setSelectedLabServices] = useState([]);
    const [medicineCharges, setMedicineCharges] = useState('0');
    const [discountPercent, setDiscountPercent] = useState('0');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [generatedBill, setGeneratedBill] = useState(null);

    useEffect(() => {
        fetchCompletedAppointments();
        fetchLabServices();
    }, []);

    const fetchCompletedAppointments = async () => {
        try {
            //  FIX: replaced localhost with API_BASE
            const response = await axios.get(`${API_BASE}/api/appointments`);
            const completed = response.data.data?.filter(apt => apt.status === 'Completed') || [];
            setAppointments(completed);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    const fetchLabServices = async () => {
        try {
            const data = await getAllLabServices();
            setLabServices(data);
        } catch (err) {
            console.error('Error fetching lab services:', err);
        }
    };

    const handleLabServiceToggle = (serviceId) => {
        if (selectedLabServices.includes(serviceId)) {
            setSelectedLabServices(selectedLabServices.filter(id => id !== serviceId));
        } else {
            setSelectedLabServices([...selectedLabServices, serviceId]);
        }
    };

    const calculateLabCharges = () => {
        return selectedLabServices.reduce((total, serviceId) => {
            const service = labServices.find(s => s.labServiceId === serviceId);
            return total + (service?.price || 0);
        }, 0);
    };

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setGeneratedBill(null);

        if (!appointmentId) {
            setMessage('Please select an appointment');
            setLoading(false);
            return;
        }

        try {
            const labCharges = calculateLabCharges();
            const bill = await generateBill(
                appointmentId,
                labCharges,
                medicineCharges,
                discountPercent,
                notes
            );

            setGeneratedBill(bill);
            setMessage('Bill generated successfully!');

        } catch (error) {
            setMessage(`Error: ${error.error || 'Failed to generate bill'}`);
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Lab Services
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {labServices.map(service => (
                                    <label key={service.labServiceId} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedLabServices.includes(service.labServiceId)}
                                            onChange={() => handleLabServiceToggle(service.labServiceId)}
                                            className="mr-3 w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{service.serviceName}</p>
                                            <p className="text-sm text-gray-600">{service.description}</p>
                                        </div>
                                        <p className="font-semibold text-blue-600">Rs {service.price.toFixed(2)}</p>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                        <div className={`mt-6 p-4 rounded-lg text-center font-medium ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                {generatedBill && (
                    <div className="bg-white shadow-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Bill Summary</h2>
                        <div className="space-y-3 text-gray-700">

                            <div className="flex justify-between border-b pb-2">
                                <span>Bill ID:</span>
                                <span className="font-semibold">{generatedBill.billId}</span>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <span>Consultation Fee:</span>
                                <span>Rs {generatedBill.consultationFee.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <span>Lab Services:</span>
                                <span>Rs {generatedBill.labCharges.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <span>Medicine Charges:</span>
                                <span>Rs {generatedBill.medicineCharges.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between border-b pb-2 font-semibold">
                                <span>Subtotal:</span>
                                <span>Rs {generatedBill.subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between border-b pb-2 text-red-600">
                                <span>Discount ({generatedBill.discountPercent}%):</span>
                                <span>-Rs {generatedBill.discountAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between border-b pb-2">
                                <span>Tax ({generatedBill.taxPercent}%):</span>
                                <span>+Rs {generatedBill.taxAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between font-bold text-lg text-blue-600">
                                <span>Total Amount:</span>
                                <span>Rs {generatedBill.totalAmount.toFixed(2)}</span>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BillGeneratorUpdated;