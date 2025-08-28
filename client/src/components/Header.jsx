import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);

  const NAV = [
    ["Home", "/"],
    ["Appointment", "/#appointment"],
    ["Services", "/#services"],
    ["About us", "/about"],
  ];

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="my-4 flex items-center justify-between rounded-full bg-white px-4 py-2 ring-1 ring-slate-200 shadow-sm">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 shadow flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 12 8 12 10 7 14 17 16 12 20 12" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800">Hospital System</span>
          </Link>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            {NAV.map(([label, to]) => (
              <li key={label}>
                <NavLink to={to} className="hover:text-slate-900">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Register
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center rounded-full w-10 h-10 ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {open ? (
              /* X icon */
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile panel */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm px-4 py-3 mb-4">
            <ul className="flex flex-col gap-3 text-slate-700">
              {NAV.map(([label, to]) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-lg px-2 py-2 hover:bg-slate-50"
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200 text-center hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white text-center hover:bg-sky-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
