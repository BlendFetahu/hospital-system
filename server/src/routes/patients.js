

const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth, requireRole } = require("../middlewares/auth");
const r = express.Router();

// LIST (ADMIN)
r.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, u.email, u.role, p.name, p.dob
     FROM patients p JOIN users u ON u.id=p.user_id ORDER BY p.id DESC`
  );
  res.json(rows);
});

// CREATE (ADMIN)  body: { email, password, name, dob }
r.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const { email, password, name, dob } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "email/password required" });
  const [dupe] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (dupe.length) return res.status(409).json({ message: "email exists" });

  const hash = bcrypt.hashSync(password, 10);
  const [u] = await pool.query("INSERT INTO users (email,password,role) VALUES (?,?,?)",
    [email, hash, "PATIENT"]);
  await pool.query("INSERT INTO patients (user_id,name,dob) VALUES (?,?,?)",
    [u.insertId, name || null, dob || null]);
  res.status(201).json({ id: u.insertId, email, role: "PATIENT", name, dob });
});

module.exports = r;
