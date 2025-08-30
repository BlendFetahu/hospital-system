// client/src/pages/PatientDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

const fmt = (v) => (v ? new Date(v).toLocaleString() : "");

export default function PatientDashboard() {
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // profile
  const [profile, setProfile] = useState({ name: "", dob: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // create appointment
  const [form, setForm] = useState({ doctorId: "", datetime: "", reason: "" });
  const [creating, setCreating] = useState(false);

  // list + search
  const [appointments, setAppointments] = useState([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((a) =>
      [
        a.reason,
        a.status,
        String(a.doctor_id ?? a.doctorId),
        a.doctor_name,
        fmt(a.scheduled_at || a.datetime),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [appointments, q]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: meRes } = await api.get("/me");
        setMe(meRes.user);

        const { data: prof } = await api.get("/patients/me");
        setProfile({
          name: prof?.name || "",
          dob: prof?.dob || "",
        });

        const { data: appts } = await api.get("/patients/me/appointments");
        setAppointments(Array.isArray(appts) ? appts : []);
        setErr("");
      } catch (e) {
        setErr(e?.response?.data?.message || "Invalid token");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setErr("");
      await api.put("/patients/me", profile);
    } catch (e) {
      setErr(e?.response?.data?.message || "Nuk u ruajt profili");
    } finally {
      setSavingProfile(false);
    }
  }

  async function createAppointment(e) {
    e.preventDefault();
    try {
      setCreating(true);
      setErr("");
      await api.post("/patients/me/appointments", {
        doctorId: Number(form.doctorId),
        datetime: form.datetime,
        reason: form.reason || null,
      });
      const { data } = await api.get("/patients/me/appointments");
      setAppointments(Array.isArray(data) ? data : []);
      setForm({ doctorId: "", datetime: "", reason: "" });
    } catch (e) {
      setErr(e?.response?.data?.message || "Nuk u krijua takimi");
    } finally {
      setCreating(false);
    }
  }

  async function cancelAppointment(id) {
    if (!confirm("Anulo këtë takim?")) return;
    try {
      await api.delete(`/patients/me/appointments/${id}`);
      setAppointments((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "S’munda ta anuloj");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* error banner */}
      {err && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {err}
        </div>
      )}

      {/* Hero / Gradient header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {profile.name || "Patient"}
            </h1>
            <p className="opacity-90">Patient Dashboard</p>
          </div>
          <span className="rounded-full bg-white/15 px-4 py-1 text-sm">Logged in</span>
        </div>
      </section>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">Appointments</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">{appointments.length}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm text-sky-800">Upcoming</p>
          <p className="mt-1 text-2xl font-semibold text-sky-900">
            {
              appointments.filter(
                (a) => new Date(a.scheduled_at || a.datetime) > new Date()
              ).length
            }
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">History</p>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {
              appointments.filter(
                (a) => new Date(a.scheduled_at || a.datetime) <= new Date()
              ).length
            }
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
          Profile
        </span>
        <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          Appointments
        </span>
      </div>

      {/* Profile + Create appointment */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Profile card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Profili im</h3>
            <span className="text-xs text-gray-500">/patients/me</span>
          </div>

          <form onSubmit={saveProfile} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-gray-700">Emri</label>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="P.sh. Bleon Sinani"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">Data e lindjes</label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={profile.dob || ""}
                onChange={(e) => setProfile((p) => ({ ...p, dob: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingProfile ? "Duke ruajtur..." : "Ruaj profilin"}
              </button>
            </div>
          </form>
        </section>

        {/* Create appointment */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Krijo takim</h3>

          <form
            onSubmit={createAppointment}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm text-gray-700">Doctor ID</label>
              <input
                required
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                placeholder="p.sh. 1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">Data/ora</label>
              <input
                required
                type="datetime-local"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.datetime}
                onChange={(e) => setForm((f) => ({ ...f, datetime: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-gray-700">Arsyeja</label>
              <input
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder="P.sh. kontroll rutinë"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {creating ? "Duke krijuar..." : "Krijo takim"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Appointments list header */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Takimet e mia</h3>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-64 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Appointments List */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <div className="text-5xl leading-none">🗒️</div>
            <div>Ende s’ka takime për t’u shfaqur</div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <li key={a.id} className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {fmt(a.scheduled_at || a.datetime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Doktor #{a.doctor_id ?? a.doctorId}{" "}
                      {a.doctor_name ? `(${a.doctor_name})` : ""} ·{" "}
                      {a.reason || "—"} {a.status ? ` · ${a.status}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    Anulo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
