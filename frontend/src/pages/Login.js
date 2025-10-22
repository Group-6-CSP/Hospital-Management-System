// import React, { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import axios from 'axios';

// function Login() {
//   const API_BASE = process.env.REACT_APP_API_BASE || '';
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const redirect = searchParams.get('redirect') || '/patient/dashboard';

//   const [credentials, setCredentials] = useState({
//     email: "",
//     password: ""
//   });
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!credentials.email || !credentials.password) {
//       setMessage("Email and Password are required");
//       return;
//     }

//     try {
//       const response = await axios.post(`${API_BASE}/api/auth/login`, credentials);
      
//       localStorage.setItem('user', JSON.stringify({
//         email: credentials.email,
//         role: response.data.role,
//         token: response.data.token
//       }));

//       if (response.data.role === 'Patient') {
//         try {
//           const patientsRes = await axios.get(`${API_BASE}/api/patients`);
//           const patient = patientsRes.data.find(p => p.email === credentials.email);
//           if (patient) {
//             localStorage.setItem('patientId', patient.patientId);
//           }
//         } catch (err) {
//           console.error('Error fetching patient ID:', err);
//         }
//       }

//       setMessage("Login successful! Redirecting...");
      
//       setTimeout(() => {
//         if (response.data.role === 'Admin') {
//           navigate('/admin/dashboard');
//         } else {
//           navigate(redirect);
//         }
//       }, 1000);
//     } catch (error) {
//       setMessage(error.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
//           Smart Care
//         </h1>
//         <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
//           Login to Your Account
//         </h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-600">Email</label>
//             <input
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               onChange={handleChange}
//               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               required
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-600">Password</label>
//             <input
//               type="password"
//               name="password"
//               placeholder="Enter your password"
//               onChange={handleChange}
//               className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//               required
//             />
//           </div>
          
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Login
//           </button>
//         </form>
        
//         {message && (
//           <p className={`mt-4 text-center text-sm ${
//             message.includes("success") ? "text-green-600" : "text-red-600"
//           }`}>
//             {message}
//           </p>
//         )}
        
//         <p className="mt-6 text-center text-gray-500 text-sm">
//           Don't have an account?{" "}
//           <a href="/register" className="text-blue-600 hover:underline font-medium">
//             Register
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
  const API_BASE = process.env.REACT_APP_API_BASE || '';
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setMessage("Email and Password are required");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, credentials);
      localStorage.setItem('user', JSON.stringify({
        email: credentials.email,
        role: response.data.role,
        token: response.data.token
      }));

      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        navigate('/dashboard'); // ✅ Unified dashboard
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Smart Care
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
