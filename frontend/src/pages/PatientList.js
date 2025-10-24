import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function PatientList() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5239/api/patients")
            .then(res => res.json())
            .then(data => setPatients(data))
            .catch(err => console.error("Error fetching patients:", err));
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this patient?")) {
            try {
                const res = await fetch(`http://localhost:5239/api/patients/${id}`, { method: "DELETE" });
                if (res.ok) setPatients(patients.filter(p => p.patientId !== id));
                else {
                    const error = await res.json();
                    alert(error.error || "Delete failed");
                }
            } catch (err) {
                alert("Request failed: " + err.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Patient List</h1>
                <Link
                    to="/admin/register"
                    className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    + Register New Patient
                </Link>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg table-auto">
                        <thead className="bg-blue-50 text-gray-700">
                            <tr>
                                <th className="border px-4 py-2 whitespace-nowrap">ID</th>
                                <th className="border px-4 py-2 whitespace-nowrap">Name</th>
                                <th className="border px-4 py-2 whitespace-nowrap">DOB</th>
                                <th className="border px-4 py-2">Age</th>
                                <th className="border px-4 py-2">Gender</th>
                                <th className="border px-4 py-2 whitespace-nowrap">Contact</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length > 0 ? patients.map(p => (
                                <tr key={p.patientId} className="hover:bg-gray-50 transition">
                                    <td className="border px-4 py-2 whitespace-nowrap">{p.patientId}</td>
                                    <td className="border px-4 py-2 whitespace-nowrap">{p.name}</td>
                                    <td className="border px-4 py-2 whitespace-nowrap">{p.dob?.substring(0, 10)}</td>
                                    <td className="border px-4 py-2 break-words">{p.age}</td>
                                    <td className="border px-4 py-2 break-words">{p.gender}</td>
                                    <td className="border px-4 py-2 whitespace-nowrap">{p.contact}</td>
                                    <td className="border px-4 py-2">{p.email}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                to={`/admin/patients/${p.patientId}/edit`}
                                                className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition w-20 text-center"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.patientId)}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-20"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-6 text-gray-500 italic">
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