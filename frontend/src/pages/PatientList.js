// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

// function PatientList() {
//     const [patients, setPatients] = useState([]);

//     useEffect(() => {
//         fetch("http://localhost:5239/api/patients")
//             .then(res => res.json())
//             .then(data => setPatients(data))
//             .catch(err => console.error("Error fetching patients:", err));
//     }, []);

//     const handleDelete = async (id) => {
//         if (window.confirm("Are you sure you want to delete this patient?")) {
//             try {
//                 const res = await fetch(`http://localhost:5239/api/patients/${id}`, { method: "DELETE" });
//                 if (res.ok) setPatients(patients.filter(p => p.patientId !== id));
//                 else {
//                     const error = await res.json();
//                     alert(error.error || "Delete failed");
//                 }
//             } catch (err) {
//                 alert("Request failed: " + err.message);
//             }
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 py-10 px-4">
//             <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
//                 <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Patient List</h1>
//                 <Link
//                     to="/admin/register"
//                     className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                     + Register New Patient
//                 </Link>

//                 <div className="overflow-x-auto">
//                     <table className="w-full border border-gray-200 rounded-lg table-auto">
//                         <thead className="bg-blue-50 text-gray-700">
//                             <tr>
//                                 <th className="border px-4 py-2 whitespace-nowrap">ID</th>
//                                 <th className="border px-4 py-2 whitespace-nowrap">Name</th>
//                                 <th className="border px-4 py-2 whitespace-nowrap">DOB</th>
//                                 <th className="border px-4 py-2">Age</th>
//                                 <th className="border px-4 py-2">Gender</th>
//                                 <th className="border px-4 py-2 whitespace-nowrap">Contact</th>
//                                 <th className="border px-4 py-2">Email</th>
//                                 <th className="border px-4 py-2 text-center">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {patients.length > 0 ? patients.map(p => (
//                                 <tr key={p.patientId} className="hover:bg-gray-50 transition">
//                                     <td className="border px-4 py-2 whitespace-nowrap">{p.patientId}</td>
//                                     <td className="border px-4 py-2 whitespace-nowrap">{p.name}</td>
//                                     <td className="border px-4 py-2 whitespace-nowrap">{p.dob?.substring(0, 10)}</td>
//                                     <td className="border px-4 py-2 break-words">{p.age}</td>
//                                     <td className="border px-4 py-2 break-words">{p.gender}</td>
//                                     <td className="border px-4 py-2 whitespace-nowrap">{p.contact}</td>
//                                     <td className="border px-4 py-2">{p.email}</td>
//                                     <td className="border px-4 py-2 text-center">
//                                         <div className="flex justify-center gap-2">
//                                             <Link
//                                                 to={`/admin/patients/${p.patientId}/edit`}
//                                                 className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition w-20 text-center"
//                                             >
//                                                 Edit
//                                             </Link>
//                                             <button
//                                                 onClick={() => handleDelete(p.patientId)}
//                                                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-20"
//                                             >
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             )) : (
//                                 <tr>
//                                     <td colSpan="8" className="text-center py-6 text-gray-500 italic">
//                                         No patients found.
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default PatientList;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PatientList() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/patients`);
            setPatients(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setMessage('❌ Failed to load patients');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this patient?')) return;

        try {
            await axios.delete(`${API_BASE}/api/patients/${id}`);
            setPatients(patients.filter(p => p.patientId !== id));
            setMessage('✅ Patient deleted successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Delete failed';
            setMessage(`❌ ${errorMsg}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading patients...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-600">Patient List</h1>
                    <Link
                        to="/admin/register"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        + Register New Patient
                    </Link>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
                        message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">ID</th>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">DOB</th>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Age</th>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Gender</th>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                                <th className="border px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                                <th className="border px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length > 0 ? (
                                patients.map(p => (
                                    <tr key={p.patientId} className="hover:bg-gray-50 transition">
                                        <td className="border px-4 py-2 text-sm">{p.patientId}</td>
                                        <td className="border px-4 py-2 font-medium">{p.name}</td>
                                        <td className="border px-4 py-2 text-sm">{p.dob?.substring(0, 10) || 'N/A'}</td>
                                        <td className="border px-4 py-2 text-sm">{p.age || 'N/A'}</td>
                                        <td className="border px-4 py-2 text-sm">{p.gender || 'N/A'}</td>
                                        <td className="border px-4 py-2 text-sm">{p.contact}</td>
                                        <td className="border px-4 py-2 text-sm">{p.email}</td>
                                        <td className="border px-4 py-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    to={`/admin/patients/${p.patientId}/edit`}
                                                    className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.patientId)}
                                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-500">
                                        No patients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PatientList;