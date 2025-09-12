import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPatient from "./pages/RegisterPatient";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPatient />} />
      </Routes>
    </Router>
  );
}

export default App;