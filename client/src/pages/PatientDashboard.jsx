// client/src/pages/PatientDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { getUser, getRole, isExpired } from "../auth";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const role = getRole();
  const user = useMemo(() => getUser(), []);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  // Personal data form (client-side only for now)
  const [profile, setProfile] = useState({
    name: "",
    dob: "",
  });

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [newAppt, setNewAppt] = useState({
    doctorId: "",
    scheduledAt: "",
    reason: "",
  });

  useEffect(() => {
    // Guard: lejo vetëm pacientin dhe token të pavlefshëm ⇒ redirect
    if (isExpired() || role !== "PATIENT") {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        // 1) Verifiko aksesin e pacientit
        await api.get("/patient/ping"); // /patient/ping kërkon requireRole("PATIENT") në backend

        // 2) Merr profilin nga /me (JWT payload)
        const { data } = await api.get("/me");
        setMe(data?.user || null);

        // 3) PROVIZORISHT: provo të lexosh appointments nëse ekziston endpoint-i
        // Në backend ende s’ka /appointments; kjo do dështojë me 404
        // Këtë e kapim me try/catch që të mos prishë UI.
        try {
          const ap = await api.get("/appointments/mine");
          setAppointments(ap.data || []);
        } catch (_) {
          // s’ben asgje – do e shtojmë kur të krijojmë ruterin e appointments
        }

        // 4) (opsionale) merr të dhënat personale nga një endpoint i ardhshëm p.sh. /patients/me
        // tani thjesht e lëmë bosh ose vendosim nga token-i
        setProfile((p) => ({
          ...p,
          name: data?.user?.name || "",
          dob: "",
        }));
      } catch (e) {
        setErr(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, role]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      // TODO: kur të shtohet endpoint-i p.sh. PUT /patients/me
      // await api.put("/patients/me", profile);
      alert("(Demo) Profili u ruajt lokalisht. Do ta lidhim me backend më pas.");
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  }

  async function handleCreateAppointment(e) {
    e.preventDefault();
    try {
      // TODO: kur të shtohet endpoint-i p.sh. POST /appointments
      // const { data } = await api.post("/appointments", newAppt);
      // setAppointments((prev) => [data, ...prev]);
      alert("(Demo) Takimi u krijua lokalisht. Lidhja me backend vjen në hapin e appointments.");
      setNewAppt({ doctorId: "", scheduledAt: "", reason: "" });
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (err) return <div style={{ padding: 24, color: "red" }}>Error: {err}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Patient Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Mirësevjen, <b>{me?.email || user?.email}</b> (role: {role})
      </p>

      {/* Profile section */}
      <section style={card}>
        <h2 style={h2}>📇 Profili im</h2>
        <form onSubmit={handleSaveProfile} style={grid2}>
          <label style={label}>
            Emri
            <input
              style={input}
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="P.sh. Bleon Sinani"
            />
          </label>
          <label style={label}>
            Data e lindjes
            <input
              style={input}
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
            />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" style={btnPrimary}>Ruaj</button>
          </div>
        </form>
      </section>

      {/* Appointments section */}
      <section style={card}>
        <h2 style={h2}>📅 Takimet e mia</h2>

        <form onSubmit={handleCreateAppointment} style={grid3}>
          <label style={label}>
            Doctor ID
            <input
              style={input}
              value={newAppt.doctorId}
              onChange={(e) => setNewAppt((p) => ({ ...p, doctorId: e.target.value }))}
              placeholder="p.sh. 1"
              required
            />
          </label>
          <label style={label}>
            Data/ora
            <input
              style={input}
              type="datetime-local"
              value={newAppt.scheduledAt}
              onChange={(e) => setNewAppt((p) => ({ ...p, scheduledAt: e.target.value }))}
              required
            />
          </label>
          <label style={label}>
            Arsyeja
            <input
              style={input}
              value={newAppt.reason}
              onChange={(e) => setNewAppt((p) => ({ ...p, reason: e.target.value }))}
              placeholder="P.sh. kontroll rutinë"
            />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" style={btnPrimary}>Krijo takim</button>
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          {appointments.length === 0 ? (
            <p style={{ color: "#666" }}>(Ende s’ka takime për t’u shfaqur)</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {appointments.map((a) => (
                <li key={a.id}>
                  #{a.id} — Doktor: {a.doctor_id} — {a.scheduled_at} — {a.status} — {a.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

// inline styles (thjeshtë për tani)
const card = { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 24 };
const h2 = { margin: 0, marginBottom: 12, fontSize: 18 };
const label = { display: "flex", flexDirection: "column", fontSize: 14, gap: 6 };
const input = { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 };
const btnPrimary = { padding: "10px 16px", borderRadius: 8, border: "1px solid #222", background: "#111", color: "#fff" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };