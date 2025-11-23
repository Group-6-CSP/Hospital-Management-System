// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// function UpdatePatient({ onPatientUpdate }) {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         name: "",
//         dob: "",
//         gender: "",
//         contact: "",
//         email: "",
//         medicalNotes: ""
//     });

//     const [message, setMessage] = useState("");
//     const [messageType, setMessageType] = useState(""); // "success" or "error"

//     useEffect(() => {
//         fetch(`http://localhost:5239/api/patients/${id}`)
//             .then((res) => res.json())
//             .then((data) => setFormData(data))
//             .catch((err) => {
//                 setMessage("Error: " + err.message);
//                 setMessageType("error");
//             });
//     }, [id]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Client-side validation
//         if (!/^[A-Za-z\s]+$/.test(formData.name)) {
//             setMessage("Name must contain only letters");
//             setMessageType("error");
//             return;
//         }
//         if (!/^\d{10}$/.test(formData.contact)) {
//             setMessage("Contact must be 10 digits");
//             setMessageType("error");
//             return;
//         }
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             setMessage("Invalid email format");
//             setMessageType("error");
//             return;
//         }
//         if (formData.medicalNotes.length > 500) {
//             setMessage("Medical Notes must be less than 500 characters");
//             setMessageType("error");
//             return;
//         }

//         try {
//             const response = await fetch(`http://localhost:5239/api/patients/${id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(formData)
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setMessage("Patient updated successfully!");
//                 setMessageType("success");
//                 if (onPatientUpdate) onPatientUpdate(data);
//                 setTimeout(() => navigate("/admin/patients"), 1500);
//             } else {
//                 const error = await response.json();
//                 setMessage(error.error || "Update failed");
//                 setMessageType("error");
//             }
//         } catch (err) {
//             setMessage("Request failed: " + err.message);
//             setMessageType("error");
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//             <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
//                 <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
//                     Update Patient
//                 </h1>
//                 <p className="text-gray-600 text-center mb-6">
//                     Edit patient details below
//                 </p>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <input
//                         type="text"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="date"
//                         name="dob"
//                         value={formData.dob?.substring(0, 10)}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                     <select
//                         name="gender"
//                         value={formData.gender}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     >
//                         <option value="">Select Gender</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                     </select>
//                     <input
//                         type="text"
//                         name="contact"
//                         value={formData.contact}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                     <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                     <textarea
//                         name="medicalNotes"
//                         value={formData.medicalNotes}
//                         onChange={handleChange}
//                         maxLength={500}
//                         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />

//                     <button
//                         type="submit"
//                         className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                     >
//                         Update
//                     </button>
//                 </form>

//                 {message && (
//                     <p
//                         className={`mt-4 text-center font-medium ${messageType === "success" ? "text-green-600" : "text-red-600"
//                             }`}
//                     >
//                         {message}
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default UpdatePatient;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdatePatient({ onPatientUpdate }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        contact: '',
        email: '',
        medicalNotes: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    //  FIXED FOR AZURE — removed localhost completely
    const API_BASE = process.env.REACT_APP_API_BASE || "";

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchPatient();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/patients/${id}`);
            setFormData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching patient:', err);
            setMessage('❌ Failed to load patient data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        if (!formData.name.trim() || !/^[A-Za-z\s]+$/.test(formData.name)) {
            setMessage('❌ Name must contain only letters');
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

        setSubmitting(true);

        try {
            const response = await axios.put(`${API_BASE}/api/patients/${id}`, formData);
            setMessage('✅ Patient updated successfully!');
            if (onPatientUpdate) onPatientUpdate(response.data);

            setTimeout(() => {
                navigate('/admin/patients');
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Update failed';
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading patient data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
                    Update Patient
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Edit patient details below
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob?.substring(0, 10) || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medical Notes
                        </label>
                        <textarea
                            name="medicalNotes"
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

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {submitting ? 'Updating...' : 'Update'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/patients')}
                            className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg text-center font-medium text-sm ${message.startsWith('✅')
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpdatePatient;