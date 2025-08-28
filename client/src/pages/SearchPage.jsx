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
    <main className="min-h-screen bg-white">
      <div className="pt-8" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-slate-800">Search</h1>

        {/* Forma vetëm për specialty (dropdown) */}
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]">
          <div>
            <label className="block text-sm font-medium text-slate-700">Specialty</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              required
            >
              <option value="">-- Zgjedh Specialty --</option>
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
              className="w-full sm:w-auto rounded-md bg-sky-600 px-4 py-2 text-white text-sm font-medium hover:bg-sky-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* Meta e kërkimit aktual */}
        <p className="text-slate-600 mt-4">
          Specialty: <b>{specialtyParam || "—"}</b>
        </p>

        {loading && (
          <div className="mt-6 rounded-xl border border-slate-200 p-6 text-slate-600">
            Loading…
          </div>
        )}

        {err && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {err}
          </div>
        )}

        {!loading && !err && doctors.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 p-6 text-slate-600">
            Nuk u gjet asnjë doktor me këtë specialty.
          </div>
        )}

        {doctors.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="rounded-xl border border-slate-200 p-5">
                <div className="h-28 rounded-lg bg-slate-100" />
                <div className="mt-3">
                  <p className="font-semibold text-slate-800">{doctor.name}</p>
                  <p className="text-sm text-slate-600">{doctor.specialty || "—"}</p>
                  {doctor.email && (
                    <p className="text-xs text-slate-500 mt-1">Email: {doctor.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
