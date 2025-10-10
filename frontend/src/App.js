import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function Home() {
    const [symptom, setSymptom] = useState("");
    const [searchResult, setSearchResult] = useState("");

    const symptoms = ["Fever", "Cough", "Headache", "Rash", "Diarrhea", "Muscle Pain"];

    const handleSearch = () => {
        if (symptom.trim() !== "") {
            setSearchResult(`Searching doctors for: ${symptom}`);
        }
    };

    const handleTagClick = (tag) => {
        setSymptom(tag);
        setSearchResult(`Searching doctors for: ${tag}`);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl font-bold mb-4">
                        Welcome to Smart Care
                    </h2>
                    <p className="text-lg text-blue-100">
                        Find the right doctor for your health needs quickly and easily.
                    </p>
                </div>
            </section>

            {/* Main Section */}
            <main className="flex-grow bg-gray-50 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
                    {/* Tell Us Your Symptom */}
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Tell Us Your Symptom
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Find the right consultant easily. Enter a symptom and get the best match for your care.
                        </p>

                        {/* Search bar */}
                        <div className="flex mb-4">
                            <input
                                type="text"
                                value={symptom}
                                onChange={(e) => setSymptom(e.target.value)}
                                placeholder="Search symptom (e.g., fever, cough)"
                                className="flex-grow border px-3 py-2 rounded-l-lg"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
                            >
                                Search
                            </button>
                        </div>

                        {/* Symptom Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {symptoms.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Placeholder Result */}
                        {searchResult && (
                            <p className="text-blue-600 font-medium">{searchResult}</p>
                        )}
                    </div>

                    {/* Search Your Doctor */}
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Search Your Doctor
                        </h3>
                        <input
                            type="text"
                            placeholder="Search doctor by name"
                            className="w-full border px-3 py-2 rounded-lg mb-3"
                        />
                        <select className="w-full border px-3 py-2 rounded-lg mb-3">
                            <option>Select Specialty</option>
                            <option>Cardiology</option>
                            <option>Dermatology</option>
                            <option>Pediatrics</option>
                        </select>
                        <input
                            type="date"
                            className="w-full border px-3 py-2 rounded-lg mb-3"
                        />
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Search Doctors
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                {/* Navbar */}
                <nav className="bg-blue-600 text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                        <h1 className="text-2xl font-bold tracking-wide">
                            Smart <span className="text-gray-200">Care</span>
                        </h1>
                        <div className="space-x-6">
                            <Link to="/" className="hover:text-gray-200 transition font-medium">
                                Home
                            </Link>
                            <Link to="/register" className="hover:text-gray-200 transition font-medium">
                                Register
                            </Link>
                            <Link to="/login" className="hover:text-gray-200 transition font-medium">
                                Login
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>

                {/* Footer */}
                <footer className="bg-gray-100 text-gray-600 py-6 mt-8">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between">
                        <p>© {new Date().getFullYear()} Smart Care Hospital. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link to="/about" className="hover:text-blue-600">About Us</Link>
                            <Link to="/emergency" className="hover:text-blue-600">Emergency Care</Link>
                            <Link to="/channeling" className="hover:text-blue-600">Doctor Channeling</Link>
                            <Link to="/contact" className="hover:text-blue-600">Contact Us</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;