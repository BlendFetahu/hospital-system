// client/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { setAuth } from "../auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.token, data.user);

      switch ((data.user?.role || "").toUpperCase()) {
        case "ADMIN":  navigate("/admin");  break;
        case "DOCTOR": navigate("/doctor"); break;
        default:       navigate("/patient");
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-slate-800">Sign in</h1>
        {err && <p className="mt-2 text-sm text-red-600 text-center">{err}</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-white font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
