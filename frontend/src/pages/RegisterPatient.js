import React, { useState } from "react";

function RegisterPatient() {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    dob: "",
    gender: "",
    contact: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://localhost:7018/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Patient Registered! ID: ${data.patientId}, Age: ${data.age}`);
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error || "Something went wrong"}`);
      }
    } catch (err) {
      setMessage(`❌ Request failed: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Register Patient</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userId"
          placeholder="User ID"
          value={formData.userId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterPatient;