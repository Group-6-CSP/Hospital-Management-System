import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function UpdatePatient({ onPatientUpdate }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        gender: "",
        contact: "",
        email: "",
        medicalNotes: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"

    useEffect(() => {
        fetch(`https://localhost:7018/api/patients/${id}`)
            .then((res) => res.json())
            .then((data) => setFormData(data))
            .catch((err) => {
                setMessage("Error: " + err.message);
                setMessageType("error");
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            setMessage("Name must contain only letters");
            setMessageType("error");
            return;
        }
        if (!/^\d{10}$/.test(formData.contact)) {
            setMessage("Contact must be 10 digits");
            setMessageType("error");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setMessage("Invalid email format");
            setMessageType("error");
            return;
        }
        if (formData.medicalNotes.length > 500) {
            setMessage("Medical Notes must be less than 500 characters");
            setMessageType("error");
            return;
        }

        try {
            const response = await fetch(`https://localhost:7018/api/patients/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setMessage("Patient updated successfully!");
                setMessageType("success");
                if (onPatientUpdate) onPatientUpdate(data);
                setTimeout(() => navigate("/admin/patients"), 1500);
            } else {
                const error = await response.json();
                setMessage(error.error || "Update failed");
                setMessageType("error");
            }
        } catch (err) {
            setMessage("Request failed: " + err.message);
            setMessageType("error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
                    Update Patient
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Edit patient details below
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob?.substring(0, 10)}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        name="medicalNotes"
                        value={formData.medicalNotes}
                        onChange={handleChange}
                        maxLength={500}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Update
                    </button>
                </form>

                {message && (
                    <p
                        className={`mt-4 text-center font-medium ${messageType === "success" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default UpdatePatient;