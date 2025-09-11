import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <Link to="/register">Register</Link> |{" "}
                    <Link to="/login">Login</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<h2>Welcome to Hospital Management System</h2>} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
