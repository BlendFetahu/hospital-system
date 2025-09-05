// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Landing from "./pages/Landing.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";
import Profile from "./auth/Profile.jsx";

import AdminRoute from "./routes/AdminRoute.jsx";

import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AboutUs from "./pages/AboutUs.jsx"
import AppointmentNew from "./pages/AppointmentNew.jsx";

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
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/appointments/new" element={<AppointmentNew />} />
       


        {/* ADMIN */}
        <Route element={<ProtectedRoute allowed={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* DOCTOR */}
        <Route element={<ProtectedRoute allowed={['DOCTOR']} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
        </Route>

        {/* PATIENT */}
        <Route element={<ProtectedRoute allowed={['PATIENT']} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
        </Route>



        {/* Error/NotFound */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
