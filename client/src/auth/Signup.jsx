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
    setErr(""); setMsg("");
    try {
      await api.post("/auth/signup", { email, password, name });
      setMsg("Account created. You can login now.");
      setTimeout(()=>navigate("/login"), 800);
    } catch (e) {
      setErr(e?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1>Patient Signup</h1>
      {msg && <p style={{color:"green"}}>{msg}</p>}
      {err && <p style={{color:"red"}}>{err}</p>}
      <form onSubmit={onSubmit}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (optional)" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}
