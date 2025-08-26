import React, { useState } from "react";
import DashboardHeader from "../components/DoctorD/DashboardHeader.jsx";
import StatsRow from "../components/DoctorD/StatsRow.jsx";
import PatientsTab from "../components/DoctorD/PatientsTab.jsx";
import AppointmentsTab from "../components/DoctorD/AppointmentsTab.jsx";
import DiagnosesTab from "../components/DoctorD/DiagnosesTab.jsx";
import Tab from "../components/DoctorD/Tab.jsx";


/* ---- Doctor Dashboard ---- */
export default function DoctorDashboard() {
  // shared: doctor profile
  const [me] = useState({
    firstName: "John",
    lastName: "Doe",
    specialty: "Internal Medicine",
    email: "doc@gmail.com",
  });

  // shared helpers
  function doctorFullName() {
    const fn = (me.firstName || "").trim();
    const ln = (me.lastName || "").trim();
    return (fn + " " + ln).trim();
  }
  function fullName(p) {
    const fn = (p.firstName || "").trim();
    const ln = (p.lastName || "").trim();
    return (fn + " " + ln).trim();
  }
  function fmt(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  }

  // shared data (mock for now; will be API later)
  const [patients, setPatients] = useState([
    { id: 1, firstName: "Patient", lastName: "One",   email: "pat1@test.com", phone: "",            gender: "Female", dob: "1999-05-05" },
    { id: 2, firstName: "Patient", lastName: "Two",   email: "pat2@test.com", phone: "044-000-002", gender: "Male",   dob: "1988-01-12" },
    { id: 3, firstName: "Patient", lastName: "Three", email: "pat3@test.com", phone: "",            gender: "Male",   dob: "" },
  ]);
  const [appointments, setAppointments] = useState([
    { id: 11, patientId: 1, patientName: "Patient One",   scheduled_at: new Date(Date.now() + 86400000).toISOString(),  status: "scheduled", reason: "Checkup" },
    { id: 12, patientId: 2, patientName: "Patient Two",   scheduled_at: new Date(Date.now() - 3600_000).toISOString(),   status: "done",      reason: "Follow-up" },
    { id: 13, patientId: 3, patientName: "Patient Three", scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(), status: "cancelled", reason: "Consult" },
  ]);
  const [diagnoses, setDiagnoses] = useState([
    { id: 21, patientId: 1, patientName: "Patient One",  title: "Hypertension", description: "BP high; recheck in 2 weeks", created_at: new Date().toISOString() },
    { id: 22, patientId: 2, patientName: "Patient Two",  title: "Diabetes T2",  description: "Diet + Metformin",            created_at: new Date().toISOString() },
  ]);

  // tabs
  const [tab, setTab] = useState("patients");

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <DashboardHeader name={doctorFullName()} specialty={me.specialty} />

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




