// server/src/routes/doctors.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");

const r = express.Router();

/* ---------------------- PUBLIC SEARCH (no auth) ---------------------- */
// GET /doctors/search?specialty=...&city=...
// kthen { items: [ { id, email, role, name, specialty, city } ] } me max 1 rekord
r.get("/search", async (req, res) => {
  const specialty = String(req.query.specialty || "").trim().toLowerCase();
  const city      = String(req.query.city || "").trim().toLowerCase();

  const where = [];
  const args  = [];

  if (specialty) { where.push("LOWER(d.specialty) = ?"); args.push(specialty); }
  if (city)      { where.push("LOWER(d.city) = ?");      args.push(city); }

  const sql = `
    SELECT d.id, u.email, u.role, d.name, d.specialty, d.city
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY d.id DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, args);
  res.json({ items: rows });
});
/* -------------------------------------------------------------------- */

/* ------------------------- ADMIN: LIST -------------------------------- */
// GET /doctors  (ADMIN)
r.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT d.id, u.email, u.role, d.name, d.specialty, d.city
     FROM doctors d JOIN users u ON u.id = d.user_id
     ORDER BY d.id DESC`
  );
  res.json(rows);
});
/* ---------------------------------------------------------------------- */

/* ------------------------- ADMIN: CREATE ------------------------------ */
// POST /doctors  body: { email, password, name, specialty }
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { email, password, name, specialty } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email/password required" });

  const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (dupe.length) return res.status(409).json({ message: "email exists" });

  const hash = bcrypt.hashSync(password, 10);
  const [u] = await pool.query(
    "INSERT INTO users (email,password,role) VALUES (?,?,?)",
    [email, hash, "DOCTOR"]
  );

  await pool.query(
    "INSERT INTO doctors (user_id,name,specialty,city) VALUES (?,?,?,?)",
    [u.insertId, name || null, specialty || null, null] // city opsionale; mund ta shtosh më vonë me UPDATE
  );

  res.status(201).json({ id: u.insertId, email, role: "DOCTOR", name, specialty });
});
/* ---------------------------------------------------------------------- */

module.exports = r;
