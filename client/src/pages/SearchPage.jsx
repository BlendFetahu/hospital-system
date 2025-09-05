// client/src/pages/SearchPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

const SPECIALTY_OPTIONS = ["General", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology"];

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // lexon nga URL
  const specialtyParam = (params.get("specialty") || params.get("query") || "").trim();

  // kontrollo inputin e formës
  const [specialtyInput, setSpecialtyInput] = useState(specialtyParam);

  // doctor data
  const [doctors, setDoctors] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch sa herë ndryshon URL
  useEffect(() => {
    const specialty = specialtyParam;
    setErr("");
    setLoading(true);

    const q = new URLSearchParams();
    if (specialty) q.set("specialty", specialty);

    api
      .get(`/doctors/search?${q.toString()}`)
      .then((res) => {
        const list = res.data?.items || [];
        setDoctors(list);
      })
      .catch(() => setErr("Failed to fetch doctors"))
      .finally(() => setLoading(false));
  }, [specialtyParam]);

  // submit i formës -> përditëson URL params
  function onSubmit(e) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (specialtyInput.trim()) q.set("specialty", specialtyInput.trim());
    navigate(`/search?${q.toString()}`);
  }

  return (
    <main className="min-h-screen">
      {/* Header me gradient (si landing) */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-50 via-sky-50 to-white" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Find a Specialist
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Choose the care you need — same-day appointments with experienced doctors.
          </p>

          {/* Forma vetëm për specialty (dropdown) */}
          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-2xl border border-emerald-100 bg-white/80 backdrop-blur px-4 py-4 sm:px-6 shadow-sm"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
              <div>
                <label className="block text-sm font-medium text-slate-700">Specialty</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  required
                >
                  <option value="">— Select specialty —</option>
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 active:scale-[.99]"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Meta e kërkimit aktual */}
            <p className="text-slate-600 mt-3">
              Specialty: <b>{specialtyParam || "—"}</b>
            </p>
          </form>
        </div>
      </section>

      {/* Rezultatet */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-14">
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Loading…
          </div>
        )}

        {err && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && doctors.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Nuk u gjet asnjë doktor me këtë specialty.
          </div>
        )}

        {doctors.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-semibold text-slate-900">Results</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="h-28 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50" />
                  <div className="mt-3">
                    <p className="font-semibold text-slate-900">{doctor.name}</p>
                    <p className="text-sm text-slate-600">{doctor.specialty || "—"}</p>
                    {doctor.email && (
                      <p className="text-xs text-slate-500 mt-1">Email: {doctor.email}</p>
                    )}
                    {doctor.city && (
                      <p className="text-xs text-slate-500">City: {doctor.city}</p>
                    )}
                  </div>

                  {/* Butoni për krijimin e takimit */}
                  <button
                    onClick={() => navigate(`/appointments/new?doctorId=${doctor.id}`)}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-white text-sm font-medium hover:bg-emerald-700"
                  >
                    Cakto takim
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

