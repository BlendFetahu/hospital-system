const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");

const router = express.Router();

/** Gjeneron JWT */
function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: (user.role || "").toUpperCase() },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
}

/** SIGNUP – lejo vetëm pacientë */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // kontrollo nëse ekziston
    const [exists] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already used" });
    }

    // krijo hash
    const hash = await bcrypt.hash(password, 10);

    // fut pacientin
    await pool.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, 'PATIENT')",
      [email, hash]
    );

    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("SIGNUP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/** LOGIN – për të gjitha rolet */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const [rows] = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = sign(user);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: (user.role || "").toUpperCase(),
        name: null // sepse users nuk ka kolonë 'name'
      }
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/ping", (_req, res) => res.send("auth-pong"));

module.exports = router;
