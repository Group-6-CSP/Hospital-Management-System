// import React, { useState } from "react";

// function RegisterPatient() {
//     const [formData, setFormData] = useState({
//         userId: "",
//         name: "",
//         dob: "",
//         gender: "",
//         contact: "",
//         email: "",
//         medicalNotes: ""
//     });
//     const [message, setMessage] = useState("");

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         // Validation
//         if (!formData.userId.trim()) { setMessage("User ID is required"); return; }
//         if (!/^[A-Za-z\s]+$/.test(formData.name)) { setMessage("Name must contain only letters"); return; }
//         if (!/^\d{10}$/.test(formData.contact)) { setMessage("Contact must be 10 digits"); return; }
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setMessage("Invalid email format"); return; }
//         if (formData.medicalNotes.length > 500) { setMessage("Medical Notes must be less than 500 characters"); return; }

//         try {
//             const response = await fetch("http://localhost:5239/api/patients", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(formData)
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setMessage(`✅ Patient Registered! ID: ${data.patientId}`);
//                 setFormData({ userId: "", name: "", dob: "", gender: "", contact: "", email: "", medicalNotes: "" });
//             } else {
//                 const error = await response.json();
//                 setMessage(`❌ Error: ${error.error || "Something went wrong"}`);
//             }
//         } catch (err) {
//             setMessage(`❌ Request failed: ${err.message}`);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//             <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
//                 <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Register Patient</h1>
//                 <p className="text-gray-600 text-center mb-6">Enter patient details to register</p>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <input type="text" name="userId" placeholder="User ID" value={formData.userId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
//                     <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
//                     <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
//                     <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
//                         <option value="">Select Gender</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                     </select>
//                     <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
//                     <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
//                     <textarea name="medicalNotes" placeholder="Medical Notes" value={formData.medicalNotes} onChange={handleChange} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />

//                     <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">Register</button>
//                 </form>

//                 {message && <p className={`mt-4 text-center font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
//             </div>
//         </div>
//     );
// }

// export default RegisterPatient;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPatient() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        dob: '',
        gender: '',
        contact: '',
        email: '',
        medicalNotes: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        if (!formData.userId.trim()) {
            setMessage('❌ User ID is required');
            return false;
        }
        if (!formData.name.trim() || !/^[A-Za-z\s]+$/.test(formData.name)) {
            setMessage('❌ Name must contain only letters');
            return false;
        }
        if (!formData.dob) {
            setMessage('❌ Date of birth is required');
            return false;
        }
        if (!formData.gender) {
            setMessage('❌ Gender is required');
            return false;
        }
        if (!formData.contact || !/^\d{10}$/.test(formData.contact)) {
            setMessage('❌ Contact must be exactly 10 digits');
            return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setMessage('❌ Valid email is required');
            return false;
        }
        if (formData.medicalNotes.length > 500) {
            setMessage('❌ Medical Notes must be less than 500 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/api/patients`, formData);
            setMessage(`✅ Patient registered successfully!\nPatient ID: ${response.data.patientId}`);
            
            setTimeout(() => {
                navigate('/admin/patients');
            }, 2000);

            setFormData({
                userId: '',
                name: '',
                dob: '',
                gender: '',
                contact: '',
                email: '',
                medicalNotes: ''
            });
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Registration failed';
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
                    Register Patient
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Enter patient details to register
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User ID *
                        </label>
                        <input
                            type="text"
                            name="userId"
                            placeholder="Enter user ID"
                            value={formData.userId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender *
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number (10 digits) *
                        </label>
                        <input
                            type="tel"
                            name="contact"
                            placeholder="e.g., 9876543210"
                            value={formData.contact}
                            onChange={handleChange}
                            maxLength="10"
                            pattern="\d{10}"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="e.g., patient@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medical Notes (Optional)
                        </label>
                        <textarea
                            name="medicalNotes"
                            placeholder="Enter any medical notes (max 500 characters)"
                            value={formData.medicalNotes}
                            onChange={handleChange}
                            maxLength="500"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows="3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.medicalNotes.length}/500
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? 'Registering...' : 'Register Patient'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg whitespace-pre-line text-center font-medium text-sm ${
                        message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegisterPatient;