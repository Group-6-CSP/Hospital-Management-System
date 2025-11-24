// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from 'axios';

// // function Register() {
// //     const navigate = useNavigate();
// //     const [formData, setFormData] = useState({
// //         fullName: "",
// //         email: "",
// //         password: "",
// //         confirmPassword: "",
// //         contact: "",
// //         dob: "",
// //         gender: ""
// //     });
// //     const [message, setMessage] = useState("");
// //     const [isLoading, setIsLoading] = useState(false);

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData({ ...formData, [name]: value });
// //     };

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setMessage("");
// //         setIsLoading(true);

// //         // Client-side validation
// //         if (!formData.fullName || !formData.email || !formData.password ||
// //             !formData.contact || !formData.dob || !formData.gender) {
// //             setMessage("All fields are required");
// //             setIsLoading(false);
// //             return;
// //         }

// //         if (formData.password !== formData.confirmPassword) {
// //             setMessage("Passwords do not match");
// //             setIsLoading(false);
// //             return;
// //         }

// //         if (formData.password.length < 6) {
// //             setMessage("Password must be at least 6 characters");
// //             setIsLoading(false);
// //             return;
// //         }

// //         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
// //             setMessage("Invalid email format");
// //             setIsLoading(false);
// //             return;
// //         }

// //         if (!/^\d{10}$/.test(formData.contact)) {
// //             setMessage("Contact must be 10 digits");
// //             setIsLoading(false);
// //             return;
// //         }

// //         try {
// //             console.log("Step 1: Registering user...");

// //             // Step 1: Register user in Users table
// //             const userResponse = await axios.post('http://localhost:5239/api/auth/register', {
// //                 fullName: formData.fullName,
// //                 dob: formData.dob,
// //                 email: formData.email,
// //                 password: formData.password,
// //                 contact: formData.contact,
// //                 role: 'Patient'
// //             });

// //             console.log("User registered successfully:", userResponse.data);
// //             const userId = userResponse.data.userId;

// //             console.log("Step 2: Creating patient record...");

// //             // Step 2: Create patient record in Patients table
// //             const patientResponse = await axios.post('http://localhost:5239/api/patients', {
// //                 userId: userId,
// //                 name: formData.fullName,
// //                 email: formData.email,
// //                 dob: formData.dob,
// //                 gender: formData.gender,
// //                 contact: formData.contact,
// //                 medicalNotes: ""
// //             });

// //             console.log("Patient created successfully:", patientResponse.data);

// //             setMessage("Registration successful! Redirecting to login...");
// //             setTimeout(() => {
// //                 navigate('/login');
// //             }, 2000);

// //         } catch (error) {
// //             console.error("Registration error:", error);

// //             // Better error handling
// //             if (error.response) {
// //                 // Server responded with error
// //                 const errorMsg = error.response.data?.error || error.response.data?.message || "Registration failed";
// //                 setMessage(errorMsg);

// //                 // Log detailed error for debugging
// //                 console.error("Server error:", error.response.data);
// //             } else if (error.request) {
// //                 // Request made but no response
// //                 setMessage("Cannot connect to server. Please make sure the backend is running.");
// //                 console.error("No response from server");
// //             } else {
// //                 // Something else happened
// //                 setMessage("Registration failed: " + error.message);
// //                 console.error("Error:", error.message);
// //             }
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     return (
// //         <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
// //             <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
// //                 <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
// //                     Smart Care Hospital
// //                 </h1>
// //                 <p className="text-gray-600 text-center mb-6">
// //                     Create your patient account
// //                 </p>

// //                 <form onSubmit={handleSubmit} className="space-y-4">
// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Full Name <span className="text-red-500">*</span>
// //                         </label>
// //                         <input
// //                             type="text"
// //                             name="fullName"
// //                             placeholder="Enter your full name"
// //                             value={formData.fullName}
// //                             onChange={handleChange}
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         />
// //                     </div>

// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Email <span className="text-red-500">*</span>
// //                         </label>
// //                         <input
// //                             type="email"
// //                             name="email"
// //                             placeholder="Enter your email"
// //                             value={formData.email}
// //                             onChange={handleChange}
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         />
// //                     </div>

// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Contact Number <span className="text-red-500">*</span>
// //                         </label>
// //                         <input
// //                             type="text"
// //                             name="contact"
// //                             placeholder="Enter 10-digit contact number"
// //                             value={formData.contact}
// //                             onChange={handleChange}
// //                             maxLength="10"
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         />
// //                     </div>

// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Date of Birth <span className="text-red-500">*</span>
// //                         </label>
// //                         <input
// //                             type="date"
// //                             name="dob"
// //                             value={formData.dob}
// //                             onChange={handleChange}
// //                             max={new Date().toISOString().split('T')[0]}
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         />
// //                     </div>

// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Gender <span className="text-red-500">*</span>
// //                         </label>
// //                         <select
// //                             name="gender"
// //                             value={formData.gender}
// //                             onChange={handleChange}
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         >
// //                             <option value="">Select Gender</option>
// //                             <option value="Male">Male</option>
// //                             <option value="Female">Female</option>
// //                             <option value="Other">Other</option>
// //                         </select>
// //                     </div>

// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Password <span className="text-red-500">*</span>
// //                         </label>
// //                         <input
// //                             type="password"
// //                             name="password"
// //                             placeholder="Create a password (min 6 characters)"
// //                             value={formData.password}
// //                             onChange={handleChange}
// //                             minLength="6"
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         />
// //                     </div>

// //                     <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">
// //                             Confirm Password <span className="text-red-500">*</span>
// //                         </label>
// //                         <input
// //                             type="password"
// //                             name="confirmPassword"
// //                             placeholder="Confirm your password"
// //                             value={formData.confirmPassword}
// //                             onChange={handleChange}
// //                             minLength="6"
// //                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //                             required
// //                         />
// //                     </div>

// //                     <button
// //                         type="submit"
// //                         disabled={isLoading}
// //                         className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
// //                     >
// //                         {isLoading ? 'Registering...' : 'Register'}
// //                     </button>
// //                 </form>

// //                 {message && (
// //                     <p className={`mt-4 text-center font-medium ${
// //                         message.includes("successful") ? "text-green-600" : "text-red-600"
// //                     }`}>
// //                         {message}
// //                     </p>
// //                 )}

// //                 <p className="mt-6 text-center text-gray-500 text-sm">
// //                     Already have an account?{" "}
// //                     <a href="/login" className="text-blue-600 hover:underline font-medium">
// //                         Login here
// //                     </a>
// //                 </p>
// //             </div>
// //         </div>
// //     );
// // }

// // export default Register;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from 'axios';

// function Register() {
//     const navigate = useNavigate();
//     const API_BASE = 'http://localhost:5239'; // Adjust if using env variable
//     const [formData, setFormData] = useState({
//         fullName: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         contact: "",
//         dob: "",
//         gender: ""
//     });
//     const [message, setMessage] = useState("");
//     const [isLoading, setIsLoading] = useState(false);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setMessage("");
//         setIsLoading(true);

//         // Client-side validation
//         if (!formData.fullName || !formData.email || !formData.password ||
//             !formData.contact || !formData.dob || !formData.gender) {
//             setMessage("All fields are required");
//             setIsLoading(false);
//             return;
//         }

//         if (formData.password !== formData.confirmPassword) {
//             setMessage("Passwords do not match");
//             setIsLoading(false);
//             return;
//         }

//         if (formData.password.length < 6) {
//             setMessage("Password must be at least 6 characters");
//             setIsLoading(false);
//             return;
//         }

//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             setMessage("Invalid email format");
//             setIsLoading(false);
//             return;
//         }

//         if (!/^\d{10}$/.test(formData.contact)) {
//             setMessage("Contact must be 10 digits");
//             setIsLoading(false);
//             return;
//         }

//         try {
//             console.log("Registering user...");

//             // Step 1: Register user
//             const response = await axios.post(`${API_BASE}/api/auth/register`, {
//                 fullName: formData.fullName,
//                 dob: formData.dob,
//                 email: formData.email,
//                 password: formData.password,
//                 contact: formData.contact,
//                 role: 'Patient'
//             });

//             // Save user info and token in localStorage
//             localStorage.setItem('user', JSON.stringify({
//                 email: formData.email,
//                 role: 'Patient',
//                 token: response.data.token
//             }));

//             // Step 2: Get patient ID from backend
//             try {
//                 const patientsRes = await axios.get(`${API_BASE}/api/patients`);
//                 const patient = patientsRes.data.find(p => p.email === formData.email);
//                 if (patient) {
//                     localStorage.setItem('patientId', patient.patientId);
//                     console.log('Patient ID saved:', patient.patientId);
//                 }
//             } catch (err) {
//                 console.error('Error fetching patient ID:', err);
//             }

//             setMessage('✅ Registration successful!');
//             setTimeout(() => navigate('/login'), 2000);

//         } catch (error) {
//             console.error("Registration error:", error);
//             if (error.response) {
//                 const errorMsg = error.response.data?.error || error.response.data?.message || "Registration failed";
//                 setMessage(`❌ ${errorMsg}`);
//             } else if (error.request) {
//                 setMessage("❌ Cannot connect to server. Make sure backend is running.");
//             } else {
//                 setMessage("❌ Registration failed: " + error.message);
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
//             <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
//                 <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
//                     Smart Care Hospital
//                 </h1>
//                 <p className="text-gray-600 text-center mb-6">
//                     Create your patient account
//                 </p>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {/* Full Name */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Full Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="fullName"
//                             placeholder="Enter your full name"
//                             value={formData.fullName}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         />
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Email <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Enter your email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         />
//                     </div>

//                     {/* Contact */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Contact Number <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="contact"
//                             placeholder="Enter 10-digit contact number"
//                             value={formData.contact}
//                             onChange={handleChange}
//                             maxLength="10"
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         />
//                     </div>

//                     {/* DOB */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Date of Birth <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="date"
//                             name="dob"
//                             value={formData.dob}
//                             onChange={handleChange}
//                             max={new Date().toISOString().split('T')[0]}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         />
//                     </div>

//                     {/* Gender */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Gender <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             name="gender"
//                             value={formData.gender}
//                             onChange={handleChange}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         >
//                             <option value="">Select Gender</option>
//                             <option value="Male">Male</option>
//                             <option value="Female">Female</option>
//                             <option value="Other">Other</option>
//                         </select>
//                     </div>

//                     {/* Password */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Password <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="password"
//                             name="password"
//                             placeholder="Create a password (min 6 characters)"
//                             value={formData.password}
//                             onChange={handleChange}
//                             minLength="6"
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         />
//                     </div>

//                     {/* Confirm Password */}
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Confirm Password <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="password"
//                             name="confirmPassword"
//                             placeholder="Confirm your password"
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                             minLength="6"
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                             required
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={isLoading}
//                         className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
//                     >
//                         {isLoading ? 'Registering...' : 'Register'}
//                     </button>
//                 </form>

//                 {message && (
//                     <p className={`mt-4 text-center font-medium ${
//                         message.includes("successful") ? "text-green-600" : "text-red-600"
//                     }`}>
//                         {message}
//                     </p>
//                 )}

//                 <p className="mt-6 text-center text-gray-500 text-sm">
//                     Already have an account?{" "}
//                     <a href="/login" className="text-blue-600 hover:underline font-medium">
//                         Login here
//                     </a>
//                 </p>
//             </div>
//         </div>
//     );
// }

// export default Register;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
    const navigate = useNavigate();

    // ✅ FIXED: Use environment variable (Azure compatible)
    const API_BASE = process.env.REACT_APP_API_BASE || "";

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contact: "",
        dob: "",
        gender: ""
    });

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        // Client-side validation
        if (!formData.fullName || !formData.email || !formData.password ||
            !formData.contact || !formData.dob || !formData.gender) {
            setMessage("All fields are required");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setMessage("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setMessage("Invalid email format");
            setIsLoading(false);
            return;
        }

        if (!/^\d{10}$/.test(formData.contact)) {
            setMessage("Contact must be 10 digits");
            setIsLoading(false);
            return;
        }

        try {
            console.log("Registering user...");

            // Step 1: Register user
            const response = await axios.post(`${API_BASE}/api/auth/register`, {
                fullName: formData.fullName,
                dob: formData.dob,
                email: formData.email,
                password: formData.password,
                contact: formData.contact,
                role: 'Patient'
            });

            // Save user info and token in localStorage
            localStorage.setItem('user', JSON.stringify({
                email: formData.email,
                role: 'Patient',
                token: response.data.token
            }));

            // Step 2: Get patient ID
            try {
                const patientsRes = await axios.get(`${API_BASE}/api/patients`);
                const patient = patientsRes.data.find(p => p.email === formData.email);
                if (patient) {
                    localStorage.setItem('patientId', patient.patientId);
                    console.log('Patient ID saved:', patient.patientId);
                }
            } catch (err) {
                console.error('Error fetching patient ID:', err);
            }

            setMessage('✅ Registration successful!');
            setTimeout(() => navigate('/login'), 2000);

        } catch (error) {
            console.error("Registration error:", error);
            if (error.response) {
                const errorMsg =
                    error.response.data?.error ||
                    error.response.data?.message ||
                    "Registration failed";

                setMessage(`❌ ${errorMsg}`);
            } else if (error.request) {
                setMessage("❌ Cannot connect to server. Make sure backend is running.");
            } else {
                setMessage("❌ Registration failed: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
                    Smart Care Hospital
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Create your patient account
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Contact */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="contact"
                            placeholder="Enter 10-digit contact number"
                            value={formData.contact}
                            onChange={handleChange}
                            maxLength="10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* DOB */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender <span className="text-red-500">*</span>
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

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password (min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="6"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            minLength="6"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center font-medium ${message.includes("successful") ? "text-green-600" : "text-red-600"
                        }`}>
                        {message}
                    </p>
                )}

                <p className="mt-6 text-center text-gray-500 text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Register;
