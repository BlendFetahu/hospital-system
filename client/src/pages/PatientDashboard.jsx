// client/src/pages/PatientDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

const fmt = (v) => (v ? new Date(v).toLocaleString() : "");

// 16 slote 30-min nga 08:00–16:00 (08:00, 08:30, …, 15:30)
const ALL_SLOTS = (() => {
  const out = [];
  for (let h = 8; h < 16; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

function isWeekend(dateStr) {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const wd = d.getDay(); // 0=Sun, 6=Sat
  return wd === 0 || wd === 6;
}

// "YYYY-MM-DD" + "HH:mm" -> "YYYY-MM-DD HH:mm:00"
function toMySQLFromParts(dateStr, hhmm) {
  if (!dateStr || !hhmm) return null;
  const hasSec = hhmm.length > 5 ? hhmm : `${hhmm}:00`;
  return `${dateStr} ${hasSec}`;
}

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // me & email paraplotësuar
  const [me, setMe] = useState(null);
  const [email, setEmail] = useState("");

  // fushat e pacientit (plotësohen manualisht nga përdoruesi)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dob, setDob]             = useState(""); // YYYY-MM-DD
  const [gender, setGender]       = useState("");
  const [phone, setPhone]         = useState("");
  const [reason, setReason]       = useState("");

  const fullName = useMemo(() => {
    const v = `${firstName || ""} ${lastName || ""}`.trim();
    return v || null;
  }, [firstName, lastName]);

  // doctors & booking slots
  const [doctors, setDoctors] = useState([]); // [{id,name,specialty,city,...}]
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState(""); // "YYYY-MM-DD"
  const [booked, setBooked] = useState([]); // ["08:30", ...]
  const [selectedTime, setSelectedTime] = useState(""); // "HH:mm"
  const availableSlots = useMemo(
    () => ALL_SLOTS.filter((t) => !booked.includes(t)),
    [booked]
  );

  const [creating, setCreating] = useState(false);

  // historiku + kërkimi
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

  // initial load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // kush jam?
        const { data: meRes } = await api.get("/me");
        setMe(meRes.user);

        // email paraplotësuar nga /patients/me ose /me
        try {
          const { data: prof } = await api.get("/patients/me");
          setEmail(prof?.email || meRes?.user?.email || "");
        } catch {
          setEmail(meRes?.user?.email || "");
        }

        // lista e doktorëve (public search)
        const { data: docsRes } = await api.get("/doctors/search");
        setDoctors(Array.isArray(docsRes?.items) ? docsRes.items : []);

        // historiku i takimeve të mia
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

  // refresh booked slots when doctor/date changes (skip weekends)
  useEffect(() => {
    setSelectedTime("");
    if (!selectedDoctorId || !date || isWeekend(date)) {
      setBooked([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(
          `/appointments/doctor/${selectedDoctorId}/booked`,
          { params: { date } }
        );
        if (!cancelled) {
          const times = Array.isArray(data?.booked) ? data.booked : [];
          setBooked(times);
        }
      } catch {
        if (!cancelled) setBooked([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDoctorId, date]);

  async function createAppointment(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    const canSubmit =
      !!selectedDoctorId &&
      !!date &&
      !isWeekend(date) &&
      !!selectedTime &&
      !!firstName &&
      !!lastName;

    if (!canSubmit) return;

    setCreating(true);
    try {
      const payload = {
        doctor_id: Number(selectedDoctorId),
        scheduled_at: toMySQLFromParts(date, selectedTime),
        reason: reason || null,
        patient: {
          first_name: firstName || null,
          last_name : lastName || null,
          name      : fullName,
          dob       : dob || null,
          email     : email || null, // paraplotësuar
          phone     : phone || null,
          gender    : gender || null,
        },
      };

      await api.post("/appointments", payload);

      // UI: hiq slotin menjëherë (opsionale)
      setBooked((prev) => Array.from(new Set([...prev, selectedTime])));
      setSelectedTime("");

      setOk("✅ Takimi u regjistrua me sukses.");

      // rifresko historikun
      const { data: appts } = await api.get("/patients/me/appointments");
      setAppointments(Array.isArray(appts) ? appts : []);
    } catch (e) {
      const s = e?.response?.status;
      if (s === 409) setErr("Ky orar është i zënë për këtë doktor. Zgjidh një orar tjetër.");
      else setErr(e?.response?.data?.message || "Nuk u ruajt takimi.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <section className="relative overflow-hidden py-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50 to-white" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-40 rounded-xl bg-emerald-100 animate-pulse" />
            <div className="mt-6 h-40 rounded-2xl border border-emerald-100 bg-white/80 shadow-sm animate-pulse" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* HERO me gradient + dekorime */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50 to-white" />
        <div className="pointer-events-none absolute -top-16 -left-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span>🩺</span> Patient Dashboard
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Përshëndetje{me?.email ? `, ${me.email}` : ""} 👋
          </h1>
          <p className="mt-2 text-slate-600">
            Cakto një takim të ri, shiko historikun dhe menaxho oraret e tua – ditët e vikendit fshihen automatikisht.
          </p>

          {/* kartë e vogël e statusit */}
          {(err || ok) && (
            <div
              className={[
                "mt-5 rounded-2xl px-4 py-3 text-sm shadow-sm border",
                err
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {err || ok}
            </div>
          )}
        </div>
      </section>

      {/* KONTEKST: pattern i lehtë pas seksioneve */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f0fdf4_25%,transparent_25%),linear-gradient(225deg,#f0fdf4_25%,transparent_25%),linear-gradient(45deg,#f0fdf4_25%,transparent_25%),linear-gradient(315deg,#f0fdf4_25%,#ffffff_25%)] bg-[length:40px_40px] opacity-40" />
          <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Cakto takim */}
          <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Cakto një takim</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium border border-emerald-200">
                <span>📅</span> Orari: 08:00–16:00 (ditë pune)
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Plotëso të dhënat dhe zgjidh një orar të lirë. Slotet e zëna fshihen automatikisht.
            </p>

            <form onSubmit={createAppointment} className="mt-5 space-y-6">
              {/* 1) Të dhënat e pacientit */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    1
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">Të dhënat e pacientit</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Emri</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                      placeholder="p.sh. Ardit"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Mbiemri</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                      placeholder="p.sh. Krasniqi"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Datëlindja</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Gjinia</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                    >
                      <option value="">—</option>
                      <option value="Male">Mashkull</option>
                      <option value="Female">Femër</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm"
                      placeholder="pacienti@example.com"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">Paraplotësuar nga llogaria juaj.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Telefoni</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                      placeholder="+383 xx xxx xxx"
                    />
                  </div>
                </div>
              </div>

              {/* 2) Orari i takimit */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    2
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">Orari i takimit</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Doktori</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                      required
                    >
                      <option value="">— Zgjidh doktorin —</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name || `Doctor #${d.id}`} {d.specialty ? `• ${d.specialty}` : ""}{" "}
                          {d.city ? `• ${d.city}` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-slate-500">Zgjidh doktorin e dëshiruar.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Data</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                      required
                    />
                    <p className="mt-1 text-[11px] text-slate-500">Vlen vetëm për ditë pune.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Arsye (opsionale)</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                      placeholder="p.sh. kontroll rutinë"
                    />
                  </div>
                </div>

                {/* Slote – FSHIH në vikend */}
                {!date || isWeekend(date) ? null : (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Zgjidh orarin</label>

                    {availableSlots.length === 0 ? (
                      <div className="text-sm text-rose-600">S’ka orare të lira në këtë ditë.</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((t) => {
                          const selected = selectedTime === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSelectedTime(t)}
                              className={[
                                "rounded-xl border px-3 py-2 text-sm shadow-sm transition",
                                selected
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[.99]",
                              ].join(" ")}
                              aria-pressed={selected}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedTime && (
                      <p className="mt-2 text-xs text-emerald-700">
                        Do të rezervohet: <b>{date}</b> në <b>{selectedTime}</b>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={
                    !selectedDoctorId ||
                    !date ||
                    isWeekend(date) ||
                    !selectedTime ||
                    !firstName ||
                    !lastName ||
                    creating
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-[.99] disabled:opacity-60"
                  title="Plotëso Emër/Mbiemër, zgjidh doktorin, ditë pune dhe orar"
                >
                  {creating ? "Duke ruajtur…" : "Cakto termin"}
                </button>

                <span className="ml-auto text-[11px] text-slate-500">
                  🔒 Të dhënat ruhen në mënyrë të sigurt sipas politikave të projektit.
                </span>
              </div>
            </form>
          </section>

          {/* Takimet e mia */}
          <section className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗂️</span>
                <h2 className="text-lg font-semibold text-slate-900">Takimet e mia</h2>
              </div>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Kërko (doktor, status, arsye, datë)…"
                className="w-72 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
              />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-2 pr-4">Data & Ora</th>
                    <th className="py-2 pr-4">Doktori</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Arsye</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="py-2 pr-4">{fmt(a.scheduled_at)}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-grid place-items-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                            {String(a.doctor_name || `#${a.doctor_id}`)
                              .split(" ")
                              .slice(0, 2)
                              .map((s) => s[0]?.toUpperCase())
                              .join("")}
                          </span>
                          <span>
                            {a.doctor_name || `#${a.doctor_id}`}
                            {a.doctor_specialty ? (
                              <span className="ml-1 inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2 py-[2px] text-[11px]">
                                {a.doctor_specialty}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full border px-2 py-[2px] text-[11px]",
                            a.status === "cancelled"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700",
                          ].join(" ")}
                        >
                          {a.status || "scheduled"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{a.reason || "—"}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-500" colSpan={4}>
                        S’ka të dhëna.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
