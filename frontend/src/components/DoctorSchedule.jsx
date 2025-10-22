import React, { useState, useEffect } from 'react';
import { getDoctorSchedule, updateDoctorSchedule } from '../services/doctorService';
import axios from 'axios';

function DoctorSchedule() {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [workingDays, setWorkingDays] = useState([]);
    const [timeSlots, setTimeSlots] = useState(['09:00-12:00', '14:00-17:00']);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:5239/api/doctors');
            setDoctors(response.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const handleDayToggle = (day) => {
        if (workingDays.includes(day)) {
            setWorkingDays(workingDays.filter(d => d !== day));
        } else {
            setWorkingDays([...workingDays, day]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await updateDoctorSchedule(selectedDoctor, workingDays, timeSlots);
            setMessage('Schedule updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`Error: ${error.error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Schedule</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Doctor
                    </label>
                    <select
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Choose doctor...</option>
                        {doctors.map(doc => (
                            <option key={doc.doctorId} value={doc.doctorId}>
                                {doc.name} - {doc.specialization}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Working Days
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {allDays.map(day => (
                            <label key={day} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={workingDays.includes(day)}
                                    onChange={() => handleDayToggle(day)}
                                    className="mr-2 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{day}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Slots (comma separated)
                    </label>
                    <textarea
                        value={timeSlots.join(', ')}
                        onChange={(e) => setTimeSlots(e.target.value.split(', '))}
                        placeholder="e.g., 09:00-12:00, 14:00-17:00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="3"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !selectedDoctor}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    {loading ? 'Updating...' : 'Update Schedule'}
                </button>
            </form>

            {message && (
                <div className={`mt-4 p-4 rounded-lg text-center font-medium ${
                    message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default DoctorSchedule;