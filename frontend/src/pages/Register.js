// JavaScript source code
import React, { useState } from "react";
import { registerUser } from "../services/authService";

function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        dob: "",
        email: "",
        password: "",
        contact: "",
        role: "Patient"
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");

    // Validation rules
    const validate = () => {
        const newErrors = {};

        if (!/^[A-Za-z ]+$/.test(formData.fullName)) {
            newErrors.fullName = "Name must contain alphabets only";
        }

        if (!formData.dob || new Date(formData.dob) > new Date()) {
            newErrors.dob = "Enter a valid date of birth";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (
            !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                formData.password
            )
        ) {
            newErrors.password =
                "Password must be at least 8 chars, include 1 uppercase, 1 number, 1 special char";
        }

        if (!/^07\d{8}$/.test(formData.contact)) {
            newErrors.contact = "Contact must be a valid 10-digit Sri Lankan number (07XXXXXXXX)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const res = await registerUser(formData);
            setMessage(`Success: ${res.message}`);
            setErrors({});
        } catch (err) {
            setMessage(`Error: ${err.error}`);
        }
    };

    return (
        <div>
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                />
                {errors.fullName && <p style={{ color: "red" }}>{errors.fullName}</p>}

                <input type="date" name="dob" onChange={handleChange} required />
                {errors.dob && <p style={{ color: "red" }}>{errors.dob}</p>}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

                <input
                    type="text"
                    name="contact"
                    placeholder="Contact Number"
                    onChange={handleChange}
                    required
                />
                {errors.contact && <p style={{ color: "red" }}>{errors.contact}</p>}

                <select name="role" onChange={handleChange}>
                    <option>Patient</option>
                    <option>Doctor</option>
                    <option>Admin</option>
                    <option>Vendor</option>
                </select>

                <button type="submit">Register</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Register;