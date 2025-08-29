// server/src/routes/doctors.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");

const r = express.Router();

/* ---------------------- PUBLIC SEARCH (no auth) ---------------------- */
// GET /doctors/search?specialty=...&city=...
// kthen { items: [ { id, email, role, name, specialty, city } ] } me max 1 rekord
// GET /doctors/search?specialty=...  (PUBLIC)
r.get("/search", async (req, res) => {
  try {
    const specialty = String(req.query.specialty || "").trim().toLowerCase();

    const where = [];
    const args  = [];

    if (specialty) {
      // lejo partial match: "cardio" -> "Cardiology"
      where.push("LOWER(d.specialty) LIKE ?");
      args.push(`%${specialty}%`);
    }

    const sql = `
      SELECT d.id, u.email, u.role, d.name, d.specialty, d.city
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY d.id DESC
      LIMIT 50
    `;

    const [rows] = await pool.query(sql, args);
    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTORS SEARCH ERROR:", err);
    res.status(500).json({ message: "Search failed" });
  }
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


/* ---------------------- DOCTOR: helpers ---------------------- */
async function getDoctorIdByUserId(pool, userId) {
  const [rows] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [userId]);
  return rows.length ? rows[0].id : null;
}

/* ---------------------- DOCTOR: pacientët e mi ---------------------- */
// GET /doctors/me/patients  (DOCTOR)
r.get("/me/patients", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const doctorId = await getDoctorIdByUserId(pool, req.user.id);
    if (!doctorId) return res.status(404).json({ message: "Doctor not found" });

    const [rows] = await pool.query(`
      SELECT DISTINCT p.*
      FROM patients p
      JOIN appointments a ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY p.id DESC
      LIMIT 100
    `, [doctorId]);

    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTOR /me/patients error:", err);
    res.status(500).json({ message: "Failed to load patients" });
  }
});

/* ---------------- DOCTOR: takimet e mia ---------------- */
// GET /doctors/me/appointments  (DOCTOR)
r.get("/me/appointments", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const [[doc]] = await pool.query(
      "SELECT id FROM doctors WHERE user_id = ?",
      [req.user.id]
    );
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    // ⬇️ mos prek emrat e kolonave; kthe a.* dhe rendit sipas a.id
    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        p.first_name, p.last_name, p.email
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      WHERE a.doctor_id = ?
      ORDER BY a.id DESC
      LIMIT 100
    `, [doc.id]);

    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTOR /me/appointments error:", err);
    res.status(500).json({ message: "Failed to load appointments" });
  }
});


/* ---------------------- DOCTOR: diagnozat e mia ---------------------- */
// GET /doctors/me/diagnoses  (DOCTOR)
r.get("/me/diagnoses", requireAuth, requireRole("DOCTOR"), async (req, res) => {
  try {
    const doctorId = await getDoctorIdByUserId(pool, req.user.id);
    if (!doctorId) return res.status(404).json({ message: "Doctor not found" });

    const [rows] = await pool.query(`
      SELECT d.id, d.patient_id, d.doctor_id, d.title, d.description, d.created_at
      FROM diagnoses d
      WHERE d.doctor_id = ?
      ORDER BY d.created_at DESC
      LIMIT 100
    `, [doctorId]);

    res.json({ items: rows });
  } catch (err) {
    console.error("DOCTOR /me/diagnoses error:", err);
    res.status(500).json({ message: "Failed to load diagnoses" });
  }
});


module.exports = r;
