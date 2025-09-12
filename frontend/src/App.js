import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">🏥 Smart Care</h1>
            <div className="space-x-6">
              <Link
                to="/register"
                className="hover:text-gray-200 transition"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="hover:text-gray-200 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-10">
            <Routes>
              <Route
                path="/"
                element={
                  <h2 className="text-center text-2xl font-semibold text-gray-700">
                    Welcome to <span className="text-blue-600">Smart Care</span> Hospital Management System
                  </h2>
                }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-500 text-center py-4 text-sm">
          © {new Date().getFullYear()} Smart Care Hospital. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;