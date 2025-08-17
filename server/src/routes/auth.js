// server/src/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

/** ⬇️ ZEVENDESO me DB-në tende. Kjo eshte vetem DEMO in-memory. */
const users = [
  // shembuj për testim të shpejtë
  { id: 1, email: "admin@gmail.com",  passwordHash: "Admin123!",  name: "Admin",  role: "ADMIN" },
  { id: 2, email: "doc@gmail.com",    passwordHash: "Doctor123!", name: "Dr. D",  role: "DOCTOR" },
  // pacientët mund të krijohen nga /auth/signup
];

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: (user.role || "").toUpperCase() },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
}

/** SIGNUP – i lejohet vetëm pacientit */
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });
  if (users.find(u => u.email === email)) return res.status(409).json({ message: "Email already used" });

  const user = {
    id: users.length + 1,
    email,
    passwordHash: password, // ⛔️ DEMO – tek DB përdor hash
    name: name || null,
    role: "PATIENT",
  };
  users.push(user);
  return res.status(201).json({ message: "User created" });
});

/** LOGIN – ⬅️ KY ndryshim është thelbësor: kthen edhe user.role */
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = user.passwordHash === password; // ⛔️ DEMO – tek DB përdor bcrypt.compare
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = sign(user);
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: (user.role || "").toUpperCase(),
      name: user.name
    }
  });
});

router.get("/ping", (_req, res) => res.send("auth-pong"));

module.exports = router;
