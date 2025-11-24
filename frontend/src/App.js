// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminDashboard from './pages/AdminDashboard';
// import RegisterPatient from './pages/RegisterPatient';
// import PatientList from './pages/PatientList';
// import UpdatePatient from './pages/UpdatePatient';
// import AppointmentList from './pages/AppointmentList';
// import AppointmentHistory from './pages/AppointmentHistory';
// import AppointmentStats from './pages/AppointmentStats';
// import PatientDashboard from './pages/PatientDashboard';
// import PatientBookAppointment from './pages/PatientBookAppointment';
// import PatientMyAppointments from './pages/PatientMyAppointments';
// import PatientProfile from './pages/PatientProfile';   

// function App() {
//     return (
//         <Router>
//             <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
                
//                 {/* Admin Routes */}
//                 <Route path="/admin/dashboard" element={<AdminDashboard />} />
//                 <Route path="/admin/register" element={<RegisterPatient />} />
//                 <Route path="/admin/patients" element={<PatientList />} />
//                 <Route path="/admin/patients/:id/edit" element={<UpdatePatient />} />
//                 <Route path="/admin/appointments" element={<AppointmentList />} />
//                 <Route path="/admin/appointments/history" element={<AppointmentHistory />} />
//                 <Route path="/admin/appointments/stats" element={<AppointmentStats />} />
                
//                 {/* Patient Routes */}
//                 <Route path="/patient/dashboard" element={<PatientDashboard />} />
//                 <Route path="/patient/book-appointment" element={<PatientBookAppointment />} />
//                 <Route path="/patient/my-appointments" element={<PatientMyAppointments />} />
//                 <Route path="/patient/profile" element={<PatientProfile />} />
//             </Routes>
//         </Router>
//     );
// }

// export default App;


//............................................................................
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// // Existing imports
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminDashboard from './pages/AdminDashboard';
// import RegisterPatient from './pages/RegisterPatient';
// import PatientList from './pages/PatientList';
// import UpdatePatient from './pages/UpdatePatient';
// import AppointmentList from './pages/AppointmentList';
// import AppointmentHistory from './pages/AppointmentHistory';
// import AppointmentStats from './pages/AppointmentStats';
// import PatientDashboard from './pages/PatientDashboard';
// import PatientBookAppointment from './pages/PatientBookAppointment';
// import PatientMyAppointments from './pages/PatientMyAppointments';
// import PatientProfile from './pages/PatientProfile';
// import Dashboard from './pages/Dashboard';

// // NEW: Billing imports
// import AdminBillingDashboard from './pages/AdminBillingDashboard';
// import PatientBillingDashboard from './pages/PatientBillingDashboard';
// import BillGenerator from './components/BillGenerator';
// import FinancialReport from './components/FinancialReport';

// function App() {
//     return (
//         <Router>
//             <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Home />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
                
//                 {/* Admin Routes */}
//                 {/*<Route path="/admin/dashboard" element={<AdminDashboard />} />*/}
//                 <Route path="/admin/register" element={<RegisterPatient />} />
//                 <Route path="/admin/patients" element={<PatientList />} />
//                 <Route path="/admin/patients/:id/edit" element={<UpdatePatient />} />
//                 <Route path="/admin/appointments" element={<AppointmentList />} />
//                 <Route path="/admin/appointments/history" element={<AppointmentHistory />} />
//                 <Route path="/admin/appointments/stats" element={<AppointmentStats />} />
                
//                 {/* NEW: Billing Routes */}
//                 <Route path="/admin/billing" element={<AdminBillingDashboard />} />
//                 <Route path="/admin/billing/generate" element={<BillGenerator />} />
//                 <Route path="/admin/billing/reports" element={<FinancialReport />} />
                
//                 {/* Patient Routes */}
//                 {/*<Route path="/patient/dashboard" element={<PatientDashboard />} />*/}
//                 <Route path="/patient/book-appointment" element={<PatientBookAppointment />} />
//                 <Route path="/patient/my-appointments" element={<PatientMyAppointments />} />
//                 <Route path="/patient/profile" element={<PatientProfile />} />
                
//                 {/* NEW: Patient Billing Routes */}
//                 <Route path="/patient/billing" element={<PatientBillingDashboard />} />
//             </Routes>
//         </Router>
//     );
// }

// export default App;
 //.....................................................


 import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
//import AdminDashboard from './pages/AdminDashboard';
import RegisterPatient from './pages/RegisterPatient';
import PatientList from './pages/PatientList';
import UpdatePatient from './pages/UpdatePatient';
import AppointmentList from './pages/AppointmentList';
import AppointmentHistory from './pages/AppointmentHistory';
import AppointmentStats from './pages/AppointmentStats';
//import PatientDashboard from './pages/PatientDashboard';
import PatientBookAppointment from './pages/PatientBookAppointment';
import PatientMyAppointments from './pages/PatientMyAppointments';
import PatientProfile from './pages/PatientProfile';
import Dashboard from './pages/Dashboard';
import AdminBillingDashboard from './pages/AdminBillingDashboard';
import PatientBillingDashboard from './pages/PatientBillingDashboard';
import BillGenerator from './components/BillGenerator';
import FinancialReport from './components/FinancialReport';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!userInfo.email) {
        return <Navigate to="/login" />;
    }
    
    if (requiredRole && userInfo.role !== requiredRole) {
        return <Navigate to="/dashboard" />;
    }
    
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Unified Dashboard - Routes based on role */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Admin Routes */}
                <Route 
                    path="/admin/register" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <RegisterPatient />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/patients" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <PatientList />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/patients/:id/edit" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <UpdatePatient />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/appointments" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AppointmentList />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/appointments/history" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AppointmentHistory />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/appointments/stats" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AppointmentStats />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/billing" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AdminBillingDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/billing/generate" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <BillGenerator />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/billing/reports" 
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <FinancialReport />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Patient Routes */}
                <Route 
                    path="/patient/book-appointment" 
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientBookAppointment />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/patient/my-appointments" 
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientMyAppointments />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/patient/profile" 
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientProfile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/patient/billing" 
                    element={
                        <ProtectedRoute requiredRole="Patient">
                            <PatientBillingDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;