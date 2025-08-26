import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const onFind = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (city.trim()) params.set("city", city.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-full bg-white text-slate-700 shadow-2xl ring-1 ring-black/5 overflow-hidden grid grid-cols-1 sm:grid-cols-3">
        {/* query */}
        <div className="flex items-center gap-3 px-5 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" strokeWidth="2"/><path d="M20 20l-3-3" strokeWidth="2"/></svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onFind()}
            placeholder="Search Specialist or Hospital"
            className="w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base"
          />
        </div>

        {/* city */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-3 border-t sm:border-t-0 sm:border-l border-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M12 21s-6.5-4.35-6.5-10A6.5 6.5 0 1112 21z"/><circle cx="12" cy="11" r="2" strokeWidth="2"/></svg>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Near you or Enter City"
            className="w-52 bg-transparent outline-none text-sm placeholder:text-slate-400"
          />
        </div>

        {/* button */}
        <div className="px-3 py-2 flex items-center justify-center sm:justify-end">
          <button
            onClick={onFind}
            className="w-full sm:w-auto rounded-full bg-amber-500 px-6 py-2.5 text-white font-semibold hover:bg-amber-600 active:scale-[.99] transition"
          >
            Find
          </button>
        </div>
      </div>
    </div>
  );
}
