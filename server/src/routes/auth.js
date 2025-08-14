const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");

const r = express.Router();

r.post("/login", async (req,res)=>{
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({message:"Missing fields"});

  const [rows] = await pool.query(
    "SELECT id, email, password, role FROM users WHERE email=? LIMIT 1",
    [email]
  );
  if(rows.length === 0) return res.status(401).json({message:"Invalid credentials"});

  const u = rows[0];
  const ok = await bcrypt.compare(password, u.password);
  if(!ok) return res.status(401).json({message:"Invalid credentials"});

  const token = jwt.sign({ id:u.id, email:u.email, role:u.role }, process.env.JWT_SECRET, { expiresIn:"2h" });
  res.json({ token, user:{ id:u.id, email:u.email, role:u.role } });
});

module.exports = r;
