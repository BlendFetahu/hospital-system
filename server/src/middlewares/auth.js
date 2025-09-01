const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // normalizo rolin në uppercase që këtu
    req.user = { ...payload, role: (payload.role || "").toUpperCase() };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireRole(expected) {
  return (req, res, next) => {
    const actual = (req.user?.role || "").toUpperCase();
    if (actual !== expected.toUpperCase()) {
      return res.status(403).json({ message: "Forbidden", need: expected, got: actual });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
