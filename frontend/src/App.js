import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterPatient from "./pages/RegisterPatient";
import PatientList from "./pages/PatientList";
import UpdatePatient from "./pages/UpdatePatient";

function App() {
    return (
        <Router>
            <Routes>
                {/* Default route -> go to Admin Dashboard */}
                <Route path="/" element={<AdminDashboard />} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/register" element={<RegisterPatient />} />
                <Route path="/admin/patients" element={<PatientList />} />
                <Route path="/admin/patients/:id/edit" element={<UpdatePatient />} />
            </Routes>
        </Router>
    );
}

export default App;