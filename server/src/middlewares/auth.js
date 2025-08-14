const jwt = require("jsonwebtoken");

function requireAuth(req,res,next){
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if(!token) return res.status(401).json({message:"No token"});
  try{ req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch{ return res.status(401).json({message:"Invalid token"}); }
}

const requireRole = (role) => (req,res,next) =>
  req.user && req.user.role === role ? next() : res.status(403).json({message:"Forbidden"});

module.exports = { requireAuth, requireRole };
