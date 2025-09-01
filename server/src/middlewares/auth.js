const jwt = require('jsonwebtoken');

function getSecret() {
  // Keep behavior consistent with routes/sign()
  return process.env.JWT_SECRET || 'devsecret';
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const payload = jwt.verify(auth.slice(7).trim(), getSecret());
    req.user = {
      id: payload.id,
      email: payload.email,
      role: (payload.role || '').toUpperCase(),
    };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };