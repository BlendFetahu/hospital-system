// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Landing from "./pages/Landing.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import Profile from "./auth/Profile.jsx";

import AdminRoute from "./routes/AdminRoute.jsx";

// ⬇️ Provizore: krijo këto dy skedarë minimalë ose zëvendëso me faqet e tua reale
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";

function Forbidden() {
  return <div style={{ padding: 24 }}><h2>403 - Forbidden</h2></div>;
}
function NotFound() {
  return <div style={{ padding: 24 }}><h2>404 - Not Found</h2></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* Publike */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        {/* ⬇️ alias që të mos marrësh 404 te /admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* DOCTOR (pa guard për momentin, vetëm që të hapet) */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />

        {/* PATIENT (pa guard për momentin) */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />

        {/* Error/NotFound */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
