import React, { useState } from "react";

function RegisterPatient() {
    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        dob: "",
        gender: "",
        contact: "",
        email: "",
        medicalNotes: ""
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation
        if (!formData.userId.trim()) { setMessage("User ID is required"); return; }
        if (!/^[A-Za-z\s]+$/.test(formData.name)) { setMessage("Name must contain only letters"); return; }
        if (!/^\d{10}$/.test(formData.contact)) { setMessage("Contact must be 10 digits"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setMessage("Invalid email format"); return; }
        if (formData.medicalNotes.length > 500) { setMessage("Medical Notes must be less than 500 characters"); return; }

        try {
            const response = await fetch("https://localhost:7018/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`✅ Patient Registered! ID: ${data.patientId}`);
                setFormData({ userId: "", name: "", dob: "", gender: "", contact: "", email: "", medicalNotes: "" });
            } else {
                const error = await response.json();
                setMessage(`❌ Error: ${error.error || "Something went wrong"}`);
            }
        } catch (err) {
            setMessage(`❌ Request failed: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Register Patient</h1>
                <p className="text-gray-600 text-center mb-6">Enter patient details to register</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="userId" placeholder="User ID" value={formData.userId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <textarea name="medicalNotes" placeholder="Medical Notes" value={formData.medicalNotes} onChange={handleChange} maxLength={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />

                    <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">Register</button>
                </form>

                {message && <p className={`mt-4 text-center font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
            </div>
        </div>
    );
}

export default RegisterPatient;