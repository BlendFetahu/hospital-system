// client/src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); 
    setMsg("");
    try {
      await api.post("/auth/signup", { email, password, name });
      setMsg("Account created. You can login now.");
      setTimeout(() => navigate("/login"), 800);
    } catch (e) {
      setErr(e?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-slate-800">Patient Signup</h1>
        
        {msg && <p className="mt-2 text-sm text-green-600 text-center">{msg}</p>}
        {err && <p className="mt-2 text-sm text-red-600 text-center">{err}</p>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              placeholder="Your name (optional)"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:ring focus:ring-sky-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-white font-medium hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
