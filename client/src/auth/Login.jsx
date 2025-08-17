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
    <div className="p-6 max-w-md mx-auto">
      <h1>Login</h1>
      {err && <p style={{color:"red"}}>{err}</p>}
      <form onSubmit={onSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
