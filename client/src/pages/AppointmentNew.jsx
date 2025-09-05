// client/src/pages/AppointmentNew.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api";

function initials(name) {
  if (!name) return "DR";
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "DR";
}

export default function AppointmentNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const doctorId = params.get("doctorId");

  // doctor fetch
  const [doctor, setDoctor] = useState(null);
  const [docErr, setDocErr] = useState("");
  const [docLoading, setDocLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      setDoctor(null);
      setDocLoading(false);
      return;
    }
    setDocErr("");
    setDocLoading(true);

    api
      .get(`/doctors/by-id/${doctorId}`)
      .then((res) => {
        const item = res.data?.item || null;
        setDoctor(item);
        if (!item) setDocErr("Doktori nuk u gjet.");
      })
      .catch(() => {
        setDoctor(null);
        setDocErr("S'mora të dhënat e doktorit.");
      })
      .finally(() => setDocLoading(false));
  }, [doctorId]);

  // patient fields (per `patients` table)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  // derived full name for `name` column
  const fullName = useMemo(() => {
    const fn = `${firstName || ""} ${lastName || ""}`.trim();
    return fn || null;
  }, [firstName, lastName]);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    setSubmitting(true);

    try {
      const payload = {
        doctor_id: doctorId ? Number(doctorId) : null, // backend can map to created_by_doctor_id
        patient: {
          first_name: firstName || null,
          last_name: lastName || null,
          name: fullName, // optional: also store concatenated name
          dob: dob || null,
          email: email || null,
          phone: phone || null,
          gender: gender || null, // enum('Male','Female')
        },
      };

      await api.post("/appointments", payload);
      setOk("Takimi u regjistrua me sukses.");
      navigate("/search");
    } catch {
      setErr("Nuk u ruajt takimi. Kontrollo fushat ose provo përsëri.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* HEADER me gradient + aksente, në stilin e landing */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50 to-white" />
        {/* blobs dekorative */}
        <div className="pointer-events-none absolute -top-16 -left-20 h-56 w-56 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <span>🩺</span> Appointment
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Cakto takim
          </h1>
          <p className="mt-2 text-slate-600">
            {docLoading ? "Po ngarkoj të dhënat e doktorit…" : "Plotëso të dhënat e pacientit për rezervim."}
          </p>

          {/* info card e doktorit */}
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur px-4 py-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white font-bold">
                {initials(doctor?.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {doctor?.name ?? "—"}
                </p>
                <p className="truncate text-sm text-slate-600">
                  {doctor?.specialty ? `Specialty: ${doctor.specialty}` : "—"}
                  {doctor?.city ? ` • ${doctor.city}` : ""}
                </p>
              </div>
              <div className="ml-auto">
                <Link
                  to="/search"
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  ⟵ Kthehu te kërkimi
                </Link>
              </div>
            </div>
            {docErr && <p className="mt-2 text-xs text-rose-600">{docErr}</p>}
          </div>
        </div>
      </section>

      {/* FORMA – me background dekorativ pas saj */}
      <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* dekor në background pas formularit */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* rrjetë diagonale e lehtë */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f0fdf4_25%,transparent_25%),linear-gradient(225deg,#f0fdf4_25%,transparent_25%),linear-gradient(45deg,#f0fdf4_25%,transparent_25%),linear-gradient(315deg,#f0fdf4_25%,#ffffff_25%)] bg-[length:40px_40px] opacity-40" />
          {/* gradient blobs shtesë */}
          <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        </div>

        {err && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {err}
          </div>
        )}
        {ok && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            {ok}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* seksion titull */}
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              1
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Të dhënat e pacientit</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <p className="mt-1 text-[11px] text-slate-500">Shkruani emrin ligjor të pacientit.</p>
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
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                placeholder="p.sh. pacienti@example.com"
              />
              <p className="mt-1 text-[11px] text-slate-500">Përdoret për njoftimet e takimit.</p>
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

          {fullName && (
            <p className="mt-3 text-xs text-slate-500">
              Emri i plotë që do ruhet: <b>{fullName}</b>
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-[.99] disabled:opacity-60"
            >
              {submitting ? "Duke ruajtur…" : "Ruaj takimin"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Anulo
            </button>

            <span className="ml-auto text-[11px] text-slate-500">
              🔒 Të dhënat ruhen në mënyrë të sigurt sipas politikave të projektit.
            </span>
          </div>
        </form>
      </section>
    </main>
  );
}
