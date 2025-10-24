import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import RegisterPatient from './pages/RegisterPatient';
import PatientList from './pages/PatientList';
import UpdatePatient from './pages/UpdatePatient';
import AppointmentList from './pages/AppointmentList';
import AppointmentHistory from './pages/AppointmentHistory';
import AppointmentStats from './pages/AppointmentStats';
import PatientDashboard from './pages/PatientDashboard';
import PatientBookAppointment from './pages/PatientBookAppointment';
import PatientMyAppointments from './pages/PatientMyAppointments';
import PatientProfile from './pages/PatientProfile';   

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/register" element={<RegisterPatient />} />
                <Route path="/admin/patients" element={<PatientList />} />
                <Route path="/admin/patients/:id/edit" element={<UpdatePatient />} />
                <Route path="/admin/appointments" element={<AppointmentList />} />
                <Route path="/admin/appointments/history" element={<AppointmentHistory />} />
                <Route path="/admin/appointments/stats" element={<AppointmentStats />} />
                
                {/* Patient Routes */}
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/book-appointment" element={<PatientBookAppointment />} />
                <Route path="/patient/my-appointments" element={<PatientMyAppointments />} />
                <Route path="/patient/profile" element={<PatientProfile />} />
            </Routes>
        </Router>
    );
}

export default App;