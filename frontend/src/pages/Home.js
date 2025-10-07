import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="bg-blue-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Smart Care Hospital</h1>
                    <div className="space-x-6">
                        <Link to="/" className="hover:text-blue-200 transition">Home</Link>
                        <Link to="/register" className="hover:text-blue-200 transition">Register</Link>
                        <Link to="/login" className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-24">
                <div className="max-w-5xl mx-auto text-center px-6">
                    <h2 className="text-5xl font-bold mb-6">
                        Channel Your Doctor Online
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        Book appointments with specialist doctors 24/7
                    </p>
                    <Link 
                        to="/login?redirect=/patient/book-appointment"
                        className="inline-block px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition shadow-xl"
                    >
                        Book Appointment
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">
                        Why Choose Smart Care?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
                            <div className="text-6xl mb-6">📅</div>
                            <h4 className="text-2xl font-bold text-gray-800 mb-4">
                                24/7 Online Booking
                            </h4>
                            <p className="text-gray-600 text-lg">
                                Book appointments anytime, anywhere from your home
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
                            <div className="text-6xl mb-6">👨‍⚕️</div>
                            <h4 className="text-2xl font-bold text-gray-800 mb-4">
                                Specialist Doctors
                            </h4>
                            <p className="text-gray-600 text-lg">
                                Access to experienced specialists across multiple departments
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition text-center">
                            <div className="text-6xl mb-6">📋</div>
                            <h4 className="text-2xl font-bold text-gray-800 mb-4">
                                Track Your Visits
                            </h4>
                            <p className="text-gray-600 text-lg">
                                View complete history of all your appointments
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Departments Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">
                        Our Departments
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg text-center hover:bg-blue-100 transition">
                            <p className="font-semibold text-gray-800">Cardiology</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg text-center hover:bg-blue-100 transition">
                            <p className="font-semibold text-gray-800">Neurology</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg text-center hover:bg-blue-100 transition">
                            <p className="font-semibold text-gray-800">Dermatology</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg text-center hover:bg-blue-100 transition">
                            <p className="font-semibold text-gray-800">Pediatrics</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-4xl font-bold text-white mb-6">
                        Ready to Book Your Appointment?
                    </h3>
                    <p className="text-blue-100 mb-8 text-xl">
                        Sign up now or login to access our services
                    </p>
                    <div className="flex gap-6 justify-center">
                        <Link 
                            to="/register"
                            className="px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition"
                        >
                            Register
                        </Link>
                        <Link 
                            to="/login"
                            className="px-10 py-4 bg-blue-700 text-white font-bold text-lg rounded-lg border-2 border-white hover:bg-blue-800 transition"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4">Smart Care Hospital</h4>
                            <p className="text-sm">Leading healthcare provider with expert doctors and modern facilities.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4">Contact</h4>
                            <p className="text-sm">Email: info@smartcare.com</p>
                            <p className="text-sm">Phone: +94 11 234 5678</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-6 text-center text-sm">
                        <p>© 2025 Smart Care Hospital. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;