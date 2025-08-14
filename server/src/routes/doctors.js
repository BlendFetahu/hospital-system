

const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");
const r = express.Router();

// LIST (ADMIN)
r.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.id, u.email, u.role, d.name, d.specialty
     FROM doctors d JOIN users u ON u.id=d.user_id ORDER BY d.id DESC`
  );
  res.json(rows);
});

// CREATE (ADMIN)  body: { email, password, name, specialty }
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { email, password, name, specialty } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email/password required" });
  const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (dupe.length) return res.status(409).json({ message: "email exists" });

  const hash = bcrypt.hashSync(password, 10);
  const [u] = await pool.query("INSERT INTO users (email,password,role) VALUES (?,?,?)",
    [email, hash, "DOCTOR"]);
  await pool.query("INSERT INTO doctors (user_id,name,specialty) VALUES (?,?,?)",
    [u.insertId, name || null, specialty || null]);
  res.status(201).json({ id: u.insertId, email, role: "DOCTOR", name, specialty });
});

module.exports = r;
