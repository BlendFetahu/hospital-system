// client/src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/DoctorD/DashboardHeader.jsx";
import StatsRow from "../components/DoctorD/StatsRow.jsx";
import PatientsTab from "../components/DoctorD/PatientsTab.jsx";
import AppointmentsTab from "../components/DoctorD/AppointmentsTab.jsx";
import DiagnosesTab from "../components/DoctorD/DiagnosesTab.jsx";
import Tab from "../components/DoctorD/Tab.jsx";

import api from "../api";
import { getRole, logout } from "../auth";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  // ---- Me (doctor) ----
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  // ---- Data from API ----
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  // ---- UI ----
  const [tab, setTab] = useState("patients");

  // ---- Helpers ----
  function doctorFullName() {
    const fn = (me?.firstName || me?.name || "").trim();
    const ln = (me?.lastName || "").trim();
    const combined = (fn + " " + ln).trim();
    // fallback to email if no name fields
    return combined || me?.email || "Doctor";
  }
  function fullName(p) {
    const fn = (p.firstName || "").trim();
    const ln = (p.lastName || "").trim();
    return (fn + " " + ln).trim() || p.email || "Unknown";
  }
  function fmt(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  }

  // ---- Guard + initial load (like AdminDashboard) ----
  useEffect(() => {
    async function run() {
      const role = getRole();
      if (role !== "DOCTOR") {
        navigate("/login", { replace: true });
        return;
      }
      try {
        // who am I?
        const meRes = await api.get("/me");
        setMe(meRes.data.user || null);

        // load data (scoped on backend to this doctor)
        const [pRes, aRes, dRes] = await Promise.all([
          api.get("/patients"),
          api.get("/appointments"),
          api.get("/diagnoses"),
        ]);

        setPatients(Array.isArray(pRes.data) ? pRes.data : pRes.data?.items ?? []);
        setAppointments(Array.isArray(aRes.data) ? aRes.data : aRes.data?.items ?? []);
        setDiagnoses(Array.isArray(dRes.data) ? dRes.data : dRes.data?.items ?? []);
      } catch (err) {
        // token invalid or API blocked → back to login
        navigate("/login", { replace: true });
      } finally {
        setChecking(false);
      }
    }
    run();
  }, [navigate]);

  if (checking) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      {/* Header (uses shared logout helper) */}
      <DashboardHeader
        name={doctorFullName()}
        specialty={me?.specialty}
        email={me?.email}
        onLogout={logout}
      />

      {/* Stats */}
      <StatsRow
        patientsCount={patients.length}
        appointmentsCount={appointments.length}
        diagnosesCount={diagnoses.length}
      />

      {/* Tabs */}
      <div className="flex gap-2">
        <Tab active={tab === "patients"} onClick={() => setTab("patients")}>Patients</Tab>
        <Tab active={tab === "appointments"} onClick={() => setTab("appointments")}>Appointments</Tab>
        <Tab active={tab === "diagnoses"} onClick={() => setTab("diagnoses")}>Diagnoses</Tab>
      </div>

      {/* Patients */}
      {tab === "patients" && (
        <PatientsTab
          patients={patients}
          setPatients={setPatients}
          fullName={fullName}
        />
      )}

      {/* Appointments */}
      {tab === "appointments" && (
        <AppointmentsTab
          appointments={appointments}
          setAppointments={setAppointments}
          fmt={fmt}
        />
      )}

      {/* Diagnoses */}
      {tab === "diagnoses" && (
        <DiagnosesTab
          patients={patients}
          diagnoses={diagnoses}
          setDiagnoses={setDiagnoses}
          fullName={fullName}
          fmt={fmt}
        />
      )}
    </div>
  );
}
