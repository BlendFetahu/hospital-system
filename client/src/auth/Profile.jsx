import { useEffect, useState } from "react";

export default function Profile() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setErr("No token. Hyni me login."); return; }

    fetch("http://localhost:4000/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.message || "Failed");
        setData(d.user); // {id,email,role}
      })
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <p style={{color:"red"}}>{err}</p>;
  if (!data) return <p>Loading…</p>;

  const ping = async () => {
    const token = localStorage.getItem("token");
    const path = {
      ADMIN:  "/admin/ping",
      DOCTOR: "/doctor/ping",
      PATIENT:"/patient/ping",
    }[data.role] || "/patient/ping";

    const res = await fetch("http://localhost:4000" + path, {
      headers: { Authorization: "Bearer " + token }
    });
    const out = await res.json();
    alert(res.ok ? "Ping OK ✅" : "Ping failed ❌: " + (out.message || ""));
  };

  return (
    <div>
      <h2>Profile</h2>
      <p><b>Email:</b> {data.email}</p>
      <p><b>Role:</b> {data.role}</p>
      <button onClick={ping}>Test {data.role} ping</button>
      <button onClick={() => { localStorage.removeItem("token"); window.location.href="/"; }} style={{marginLeft:8}}>
        Logout
      </button>
    </div>
  );
}
