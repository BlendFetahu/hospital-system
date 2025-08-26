// client/src/pages/SearchPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

const CITY_OPTIONS = ["Prishtinë", "Prizren", "Pejë", "Gjakovë", "Ferizaj", "Mitrovicë"];
const SPECIALTY_OPTIONS = ["General", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology"];

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // lexon nga URL (ruaj kompat. me 'query')
  const specialtyParam = (params.get("specialty") || params.get("query") || "").trim();
  const cityParam = (params.get("city") || "").trim();

  // kontrollo inputet e formës
  const [specialtyInput, setSpecialtyInput] = useState(specialtyParam);
  const [cityInput, setCityInput] = useState(cityParam);

  // doctor data
  const [doctor, setDoctor] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // kur ndryshon URL, bëj fetch
  useEffect(() => {
    const specialty = specialtyParam;
    const city = cityParam;

    setErr("");
    setLoading(true);

    const q = new URLSearchParams();
    if (specialty) q.set("specialty", specialty);
    if (city) q.set("city", city);

    api
      .get(`/doctors/search?${q.toString()}`)
      .then((res) => {
        const list = res.data?.items || [];
        setDoctor(list[0] || null);
      })
      .catch(() => setErr("Failed to fetch doctor"))
      .finally(() => setLoading(false));
  }, [specialtyParam, cityParam]);

  // submit i formës -> përditëson URL params
  function onSubmit(e) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (specialtyInput.trim()) q.set("specialty", specialtyInput.trim());
    if (cityInput.trim()) q.set("city", cityInput.trim());
    navigate(`/search?${q.toString()}`);
  }

  // UI
  return (
    <main className="min-h-screen bg-white">
      <div className="pt-8" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-slate-800">Search</h1>

        {/* Forma me datalist për specialty & city */}
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
          <div>
            <label className="block text-sm font-medium text-slate-700">Specialty</label>
            <input
              type="text"
              list="specialty-list"
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              placeholder="p.sh. General, Cardiology…"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
              required
            />
            <datalist id="specialty-list">
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input
              type="text"
              list="city-list"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="p.sh. Prishtinë"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
            />
            <datalist id="city-list">
              {CITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
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

        {/* Meta e kërkimit aktual (nga URL) */}
        <p className="text-slate-600 mt-4">
          Specialty: <b>{specialtyParam || "—"}</b>
          {cityParam ? <> · City: <b>{cityParam}</b></> : null}
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

        {!loading && !err && !doctor && (
          <div className="mt-6 rounded-xl border border-slate-200 p-6 text-slate-600">
            Nuk u gjet asnjë doktor me këto filtre.
          </div>
        )}

        {doctor && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="h-28 rounded-lg bg-slate-100" />
              <div className="mt-3">
                <p className="font-semibold text-slate-800">{doctor.name}</p>
                <p className="text-sm text-slate-600">{doctor.specialty || "—"}</p>
                {doctor.city && (
                  <p className="text-xs text-slate-500 mt-1">{doctor.city}</p>
                )}
                {doctor.email && (
                  <p className="text-xs text-slate-500 mt-1">Email: {doctor.email}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
