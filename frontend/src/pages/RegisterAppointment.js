import React, { useState } from "react";

function RegisterAppointment() {
    const [formData, setFormData] = useState({
        patientId: "",
        doctorName: "",
        department: "",
        appointmentDate: "",
        status: "Scheduled"
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patientId.trim()) { setMessage("Patient ID is required"); return; }
        if (!formData.doctorName.trim()) { setMessage("Doctor Name is required"); return; }
        if (!formData.department.trim()) { setMessage("Department is required"); return; }

        try {
            const res = await fetch("http://localhost:5239/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage(" Appointment created successfully!");
                setFormData({
                    patientId: "",
                    doctorName: "",
                    department: "",
                    appointmentDate: "",
                    status: "Scheduled"
                });
            } else {
                const error = await res.json();
                setMessage(` Error: ${error.message || "Failed to create appointment"}`);
            }
        } catch (err) {
            setMessage(" Request failed: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
                    Register Appointment
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Enter appointment details below
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="patientId"
                        placeholder="Patient ID (e.g. P001)"
                        value={formData.patientId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="text"
                        name="doctorName"
                        placeholder="Doctor Name"
                        value={formData.doctorName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="text"
                        name="department"
                        placeholder="Department (e.g. Cardiology)"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="datetime-local"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        Register
                    </button>
                </form>

                {message && (
                    <p
                        className={`mt-4 text-center font-medium ${
                            message.startsWith("✅") ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default RegisterAppointment;
