// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import  api  from "../api";
import { logout } from "../auth";

export default function AdminDashboard() {
  const [me, setMe] = useState(null);

  // për të shfaqur info-n e kyçur
  useEffect(() => {
    api.get("/me").then((res) => setMe(res.data.user)).catch(() => {});
  }, []);

  // forma për të shtuar usera
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("DOCTOR"); // default
  const [msg, setMsg] = useState(null);

  async function addUser(e) {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/admin/users", { email, password, name, role });
      setMsg(`User created as ${role}`);
      setEmail(""); setPassword(""); setName("");
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Failed");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Mirë se erdhe, Admin!</p>
      <div style={{ marginBottom: 16 }}>
        <strong>Logged in as:</strong>{" "}
        {me ? `${me.email} (${me.role})` : "Loading..."}
      </div>

      <hr />

      <h3>Add User (Doctor/Patient)</h3>
      <form onSubmit={addUser} style={{ maxWidth: 420 }}>
        <input
          placeholder="Emri (opsional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
        >
          <option value="DOCTOR">DOCTOR</option>
          <option value="PATIENT">PATIENT</option>
        </select>

        <button type="submit" style={{ padding: "8px 12px" }}>Create</button>
      </form>

      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}

      <hr />
      <button onClick={logout} style={{ padding: "8px 12px" }}>Log out</button>
    </div>
  );
}
