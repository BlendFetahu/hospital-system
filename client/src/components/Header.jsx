import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    // sticky => nuk mbulon përmbajtjen; zgjidh overlapp-in që pate në Register
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="my-4 flex items-center justify-between rounded-full bg-white px-4 py-2 ring-1 ring-slate-200 shadow-sm">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-sky-600" />
            <span className="font-semibold text-slate-800">Hospital System</span>
          </Link>

          {/* Menu */}
          <ul className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            {[
              ["Home", "/"],
              ["Appointment", "/#appointment"],
              ["Services", "/#services"],
              ["About us", "/#about"],
            ].map(([label, to]) => (
              <li key={label}>
                <NavLink to={to} className="hover:text-slate-900">
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Auth */}
          <div className="flex items-center gap-2">
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
        </nav>
      </div>
    </header>
  );
}
